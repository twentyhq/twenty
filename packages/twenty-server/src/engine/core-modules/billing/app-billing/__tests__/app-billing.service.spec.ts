import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_ID = '20202020-0000-4000-8000-000000000002';

const buildService = (billingOperations: Record<string, unknown> = {}) => {
  const charge = jest.fn();

  const service = new AppBillingService(
    { charge } as never,
    {
      getOrRecompute: async () => ({
        flatApplicationMaps: {
          byId: {
            [APPLICATION_ID]: {
              id: APPLICATION_ID,
              deletedAt: null,
              billing: { operations: billingOperations },
            },
          },
        },
      }),
    } as never,
    {} as never,
  );

  return { service, charge };
};

const emitCharge = ({
  service,
  charge,
}: {
  service: AppBillingService;
  charge: Partial<ChargeDto>;
}) =>
  service.emitChargeEvent({
    workspaceId: WORKSPACE_ID,
    applicationId: APPLICATION_ID,
    userWorkspaceId: null,
    charge: { creditsUsedMicro: 1_000, quantity: 1, ...charge } as ChargeDto,
  });

const getRecordedEvent = (charge: jest.Mock) =>
  charge.mock.calls[0][0].events[0];

describe('AppBillingService.emitChargeEvent', () => {
  it('should record a charge naming no category under APP_OPERATION', async () => {
    const { service, charge } = buildService();

    await emitCharge({ service, charge: {} });

    expect(getRecordedEvent(charge)).toMatchObject({
      operationType: UsageOperationType.APP_OPERATION,
      unit: UsageUnit.INVOCATION,
      resourceContext: null,
    });
  });

  it('should record a declared operation with only a label under APP_OPERATION', async () => {
    const { service, charge } = buildService({
      enrichPerson: { label: 'Person enrichment' },
    });

    await emitCharge({ service, charge: { operation: 'enrichPerson' } });

    expect(getRecordedEvent(charge)).toMatchObject({
      operationType: UsageOperationType.APP_OPERATION,
      unit: UsageUnit.INVOCATION,
      resourceContext: 'enrichPerson',
    });
  });

  it('should keep the category a declared operation names', async () => {
    const { service, charge } = buildService({
      recordMeeting: { operationType: 'CALL_RECORDING', label: 'Recording' },
    });

    await emitCharge({ service, charge: { operation: 'recordMeeting' } });

    expect(getRecordedEvent(charge)).toMatchObject({
      operationType: UsageOperationType.CALL_RECORDING,
      unit: UsageUnit.MINUTE,
    });
  });

  it('should reject a declared operation with a platform-only category', async () => {
    const { service, charge } = buildService({
      sneaky: { operationType: 'SUBSCRIPTION', label: 'Sneaky' },
    });

    await expect(
      emitCharge({ service, charge: { operation: 'sneaky' } }),
    ).rejects.toThrow('declares an unknown operationType');
    expect(charge).not.toHaveBeenCalled();
  });
});

describe('ChargeDto', () => {
  const validateCharge = (body: Record<string, unknown>) =>
    validate(
      plainToInstance(ChargeDto, {
        creditsUsedMicro: 1_000,
        quantity: 1,
        ...body,
      }),
      { whitelist: true, forbidNonWhitelisted: true },
    );

  it('should accept a charge naming no category', async () => {
    expect(await validateCharge({})).toHaveLength(0);
  });

  it.each(['SUBSCRIPTION', 'API_REQUEST', 'UNKNOWN'])(
    'should reject the operationType %s',
    async (operationType) => {
      expect(await validateCharge({ operationType })).not.toHaveLength(0);
    },
  );
});
