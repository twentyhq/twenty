import { ConfigService } from '../../services/config.service';
import { testConfig } from './constants/testConfig';

beforeAll(() => {
  jest
    .spyOn(ConfigService.prototype, 'getConfig')
    .mockResolvedValue(testConfig);
});

afterAll(() => {
  jest.restoreAllMocks();
});
