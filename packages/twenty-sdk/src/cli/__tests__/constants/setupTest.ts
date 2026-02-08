import { ConfigService } from '@/cli/utilities/config/config-service';
import { testConfig } from '@/cli/__tests__/constants/testConfig';
import { vi, beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  vi.spyOn(ConfigService.prototype, 'getConfig').mockResolvedValue(testConfig);
});

afterAll(() => {
  vi.restoreAllMocks();
});
