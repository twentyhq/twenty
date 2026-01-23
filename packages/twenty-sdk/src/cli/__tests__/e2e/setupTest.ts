import { ConfigService } from '@/cli/utilities/config/config-service';
import { testConfig } from '@/cli/__tests__/e2e/constants/testConfig';
import { vi, beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  vi.spyOn(ConfigService.prototype, 'getConfig').mockResolvedValue(testConfig);
});

afterAll(() => {
  vi.restoreAllMocks();
});
