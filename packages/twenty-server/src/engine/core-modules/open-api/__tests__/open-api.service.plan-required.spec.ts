/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { OpenApiService } from 'src/engine/core-modules/open-api/open-api.service';

describe('OpenApiService plan-required gate', () => {
  const assertWorkspaceHasRequiredPlan = jest.fn();
  const getConfig = jest.fn();
  const validateTokenByRequest = jest.fn();
  const getOrRecomputeManyOrAllFlatEntityMaps = jest.fn();

  const buildService = () =>
    new OpenApiService(
      { validateTokenByRequest } as never,
      { get: getConfig } as never,
      { getOrRecomputeManyOrAllFlatEntityMaps } as never,
      { assertWorkspaceHasRequiredPlan } as never,
    );

  beforeEach(() => {
    assertWorkspaceHasRequiredPlan.mockReset();
    getConfig.mockReset();
    validateTokenByRequest.mockReset();
    getOrRecomputeManyOrAllFlatEntityMaps.mockReset();

    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return true;
      }

      if (key === 'SERVER_URL') {
        return 'http://localhost:3000';
      }

      return undefined;
    });

    validateTokenByRequest.mockResolvedValue({
      workspace: { id: 'ws-unpaid' },
    });
  });

  it('denies enriched core schema when unpaid and flag on', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const service = buildService();

    await expect(
      service.generateCoreSchema({
        protocol: 'http',
        get: () => 'localhost',
      } as never),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
    });
    expect(getOrRecomputeManyOrAllFlatEntityMaps).not.toHaveBeenCalled();
  });

  it('allows base schema when no workspace token (anonymous)', async () => {
    validateTokenByRequest.mockRejectedValue(new Error('no token'));

    const service = buildService();
    const schema = await service.generateCoreSchema({
      protocol: 'http',
      get: () => 'localhost',
    } as never);

    expect(schema).toBeDefined();
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('denies enriched metadata schema when unpaid and flag on', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const service = buildService();

    await expect(
      service.generateMetaDataSchema({
        protocol: 'http',
        get: () => 'localhost',
      } as never),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
    });
  });

  it('skips assert when enforcement flag is off', async () => {
    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return false;
      }

      if (key === 'SERVER_URL') {
        return 'http://localhost:3000';
      }

      return undefined;
    });
    getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
      flatObjectMetadataMaps: { byUniversalIdentifier: {} },
      flatFieldMetadataMaps: { byUniversalIdentifier: {} },
    });

    const service = buildService();
    await service.generateCoreSchema({
      protocol: 'http',
      get: () => 'localhost',
    } as never);

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });
});
