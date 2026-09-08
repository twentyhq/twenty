import { ForbiddenException, ValidationPipe } from '@nestjs/common';
import { type Request } from 'express';

import { AppBillingController } from 'src/engine/core-modules/billing/app-billing/app-billing.controller';
import { type AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { type AppBillingChargeService } from 'src/engine/core-modules/billing/app-billing/app-billing-charge.service';
import { IdempotentChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/idempotent-charge.dto';
import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

jest.mock('src/engine/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class {},
}));
jest.mock('src/engine/guards/workspace-auth.guard', () => ({
  WorkspaceAuthGuard: class {},
}));
jest.mock('src/engine/guards/no-permission.guard', () => ({
  NoPermissionGuard: class {},
}));
jest.mock(
  'src/engine/core-modules/billing/app-billing/app-billing.service',
  () => ({ AppBillingService: class {} }),
);
jest.mock(
  'src/engine/core-modules/billing/app-billing/app-billing-charge.service',
  () => ({ AppBillingChargeService: class {} }),
);
jest.mock('src/engine/core-modules/throttler/throttler.service', () => ({
  ThrottlerService: class {},
}));
jest.mock(
  'src/engine/core-modules/twenty-config/twenty-config.service',
  () => ({ TwentyConfigService: class {} }),
);

const charge: IdempotentChargeDto = {
  idempotencyKey: 'recording-1',
  quantity: 1,
  creditsUsedMicro: 100,
  operationType: UsageOperationType.CALL_RECORDING,
};
const request = {
  workspace: { id: 'workspace' },
  application: { id: 'app' },
  userWorkspaceId: 'user-workspace',
} as unknown as Request;
const accept = jest.fn();
const get = jest.fn();
const throttle = jest.fn();
const controller = new AppBillingController(
  {} as AppBillingService,
  { tokenBucketThrottleOrThrow: throttle } as unknown as ThrottlerService,
  { get } as unknown as TwentyConfigService,
  { accept } as unknown as AppBillingChargeService,
);

beforeEach(() => {
  jest.resetAllMocks();
  get.mockReturnValue(true);
  accept.mockResolvedValue({ status: 'accepted', receiptId: 'receipt' });
});

it.each([true, false])(
  'rejects requests without application identity even when billing enabled is %s',
  async (enabled) => {
    get.mockReturnValue(enabled);
    await expect(
      controller.chargeIdempotent(
        { ...request, application: undefined } as Request,
        charge,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      controller.chargeIdempotent(
        { ...request, workspace: undefined } as Request,
        charge,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(accept).not.toHaveBeenCalled();
  },
);

it('returns an explicit disabled result without accepting a receipt', async () => {
  get.mockReturnValue(false);
  expect(await controller.chargeIdempotent(request, charge)).toEqual({
    status: 'disabled',
  });
  expect(accept).not.toHaveBeenCalled();
});

it('scopes receipt acceptance to authenticated identities and propagates persistence failures', async () => {
  expect(await controller.chargeIdempotent(request, charge)).toEqual({
    status: 'accepted',
    receiptId: 'receipt',
  });
  expect(accept).toHaveBeenCalledWith({
    workspaceId: 'workspace',
    applicationId: 'app',
    userWorkspaceId: 'user-workspace',
    charge,
  });
  expect(throttle).toHaveBeenCalled();
  accept.mockRejectedValueOnce(new Error('database unavailable'));
  await expect(controller.chargeIdempotent(request, charge)).rejects.toThrow(
    'database unavailable',
  );
});

it.each([
  { idempotencyKey: undefined },
  { idempotencyKey: '' },
  { idempotencyKey: 'x'.repeat(201) },
  { creditsUsedMicro: -1 },
  { creditsUsedMicro: 1.5 },
  { quantity: 0 },
  { operationType: 'INVALID' },
  { workspaceId: 'forged-workspace' },
])(
  'validates receipt keys and inherited charge constraints: %j',
  async (invalid) => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    await expect(
      pipe.transform(
        { ...charge, ...invalid },
        { type: 'body', metatype: IdempotentChargeDto },
      ),
    ).rejects.toThrow();
  },
);
