import axios from 'axios';
import { SERVER_URL } from '@/cli/__tests__/e2e/constants/server-url.constant';

describe('Twenty Server Health Check (E2E)', () => {
  const HEALTH_ENDPOINT = `${SERVER_URL}/healthz`;

  it('should return 200 for health', async () => {
    const response = await axios.get(HEALTH_ENDPOINT);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });
});
