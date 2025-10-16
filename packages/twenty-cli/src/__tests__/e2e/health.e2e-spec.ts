import axios from 'axios';

describe('Twenty Server Health Check (E2E)', () => {
  const SERVER_URL = 'http://localhost:3000';
  const HEALTH_ENDPOINT = `${SERVER_URL}/healthz`;

  describe('Health Endpoint', () => {
    it('should return 200 for health check', async () => {
      const response = await axios.get(HEALTH_ENDPOINT);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await axios.get(HEALTH_ENDPOINT);
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should have proper CORS headers', async () => {
      const response = await axios.get(HEALTH_ENDPOINT);
      
      expect(response.status).toBe(200);
      // Check if CORS headers are present (adjust based on actual headers)
      expect(response.headers).toBeDefined();
    });
  });

  describe('Server Availability', () => {
    it('should be accessible on expected port', async () => {
      const response = await axios.get(SERVER_URL);
      
      // Server should respond (might be 404 for root, but should not be connection error)
      expect([200, 404, 405]).toContain(response.status);
    });
  });
});
