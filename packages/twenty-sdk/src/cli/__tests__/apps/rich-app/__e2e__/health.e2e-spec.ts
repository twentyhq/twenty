import axios from 'axios';
import { getServerUrl } from '@/cli/__tests__/constants/server-url.constant';

describe('Twenty Server Health Check (E2E)', () => {
  let healthEndpoint: string;

  beforeAll(async () => {
    const serverUrl = await getServerUrl();

    healthEndpoint = `${serverUrl}/healthz`;
  });

  it('should return 200 for health', async () => {
    const response = await axios.get(healthEndpoint);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });
});
