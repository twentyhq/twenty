import axios from 'axios';
import { ConfigService } from '../../services/config.service';
import { SERVER_URL } from './constants/server-url.constant';

describe('Twenty Server Health Check (E2E)', () => {
  const configService = new ConfigService();
  const HEALTH_ENDPOINT = `${SERVER_URL}/healthz`;

  it('should assert e2e configuration is loaded by default', async () => {
    const configuration = await configService.getConfig();
    expect(configuration).toMatchObject({
      defaultApp: 'e2e-default-app',
    });
  });

  it('should return 200 for health', async () => {
    const response = await axios.get(HEALTH_ENDPOINT);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });
});
