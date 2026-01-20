import { ConfigService } from '@/cli/utilities/config/services/config.service';
import { testConfig } from '@/cli/__tests__/e2e/constants/testConfig';

beforeAll(() => {
  jest
    .spyOn(ConfigService.prototype, 'getConfig')
    .mockResolvedValue(testConfig);
});

afterAll(() => {
  jest.restoreAllMocks();
});
