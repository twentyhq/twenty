import axios from 'axios';
import { ConfigService } from '../../services/config.service';
import { SERVER_URL } from '../constants/server-url.constant';

describe('Twenty Server Health Check (E2E)', () => {
  const HEALTH_ENDPOINT = `${SERVER_URL}/healthz`;
  const configService = new ConfigService();

  it('should return 200 for health check', async () => {
    const response = await axios.get(HEALTH_ENDPOINT);
    const configuration = await configService.getConfig();
    expect(configuration).toMatchObject({
      defaultApp: 'e2e-default-app',
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });
});
