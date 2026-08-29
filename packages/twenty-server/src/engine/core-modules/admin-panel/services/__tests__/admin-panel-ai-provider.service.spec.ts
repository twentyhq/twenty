/* @license Enterprise */

import { AdminPanelAiProviderService } from 'src/engine/core-modules/admin-panel/services/admin-panel-ai-provider.service';
import { MAX_SEATS_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/enterprise/constants/max-seats-without-enterprise-key.constant';
import {
  EnterpriseException,
  EnterpriseExceptionCode,
} from 'src/engine/core-modules/enterprise/enterprise.exception';

describe('AdminPanelAiProviderService', () => {
  const buildService = ({
    isBillingEnabled = false,
    isEnterpriseValid = false,
    seatCount = 1,
  }: {
    isBillingEnabled?: boolean;
    isEnterpriseValid?: boolean;
    seatCount?: number;
  } = {}) => {
    const providers: Record<string, unknown> = {};

    const twentyConfigService = {
      get: jest.fn((key: string) =>
        key === 'IS_BILLING_ENABLED' ? isBillingEnabled : providers,
      ),
      set: jest.fn(async (_key: string, value: Record<string, unknown>) => {
        Object.assign(providers, value);
      }),
    };

    const enterprisePlanService = {
      isValid: jest.fn(() => isEnterpriseValid),
      getBillableSeatCount: jest.fn(async () => seatCount),
    };

    const service = new AdminPanelAiProviderService(
      twentyConfigService as never,
      enterprisePlanService as never,
      {} as never,
      {} as never,
    );

    return { service, twentyConfigService, enterprisePlanService };
  };

  const addProvider = (service: AdminPanelAiProviderService) =>
    service.addProvider('my-gateway', {
      npm: '@ai-sdk/openai-compatible',
      baseUrl: 'https://gateway.internal',
    } as never);

  describe('addProvider', () => {
    it('allows an instance below the seat threshold without an enterprise key', async () => {
      const { service } = buildService({
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY - 1,
      });

      await expect(addProvider(service)).resolves.toBe(true);
    });

    it('allows an instance exactly at the seat threshold', async () => {
      const { service } = buildService({
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY,
      });

      await expect(addProvider(service)).resolves.toBe(true);
    });

    it('rejects an instance above the seat threshold without an enterprise key', async () => {
      const { service, twentyConfigService } = buildService({
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1,
      });

      await expect(addProvider(service)).rejects.toThrow(
        expect.objectContaining({
          code: EnterpriseExceptionCode.ENTERPRISE_SEAT_THRESHOLD_EXCEEDED,
        }) as unknown as EnterpriseException,
      );

      expect(twentyConfigService.set).not.toHaveBeenCalled();
    });

    it('allows an instance above the seat threshold with a valid enterprise key', async () => {
      const { service } = buildService({
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 100,
        isEnterpriseValid: true,
      });

      await expect(addProvider(service)).resolves.toBe(true);
    });

    it('allows a billing-enabled instance regardless of its instance-wide seat count', async () => {
      const { service, enterprisePlanService } = buildService({
        seatCount: 10_000,
        isBillingEnabled: true,
      });

      await expect(addProvider(service)).resolves.toBe(true);
      expect(enterprisePlanService.isValid).not.toHaveBeenCalled();
    });

    it('rejects a provider name that is not slug-safe', async () => {
      const { service } = buildService();

      await expect(
        service.addProvider('not a slug', {} as never),
      ).rejects.toThrow('Invalid provider name');
    });
  });

  describe('removeProvider', () => {
    it('stays available above the seat threshold so providers can be cleaned up', async () => {
      const { service, twentyConfigService } = buildService({
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1,
      });

      await expect(service.removeProvider('my-gateway')).resolves.toBe(true);
      expect(twentyConfigService.set).toHaveBeenCalled();
    });
  });

  describe('getCustomAiProviderAccess', () => {
    it('reports the threshold and the current seat count', async () => {
      const { service } = buildService({ seatCount: 42 });

      await expect(service.getCustomAiProviderAccess()).resolves.toEqual({
        hasAccess: false,
        seatCount: 42,
        seatThreshold: MAX_SEATS_WITHOUT_ENTERPRISE_KEY,
      });
    });
  });
});
