import axios from 'axios';

describe('Twenty Server Health Check (E2E)', () => {
  const SERVER_URL = 'http://localhost:3000';
  const HEALTH_ENDPOINT = `${SERVER_URL}/healthz`;

  it('should return 200 for health check', async () => {
    const response = await axios.get(HEALTH_ENDPOINT);

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });
});
