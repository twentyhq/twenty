import axios from 'axios';
import { SERVER_URL } from './constants/server-url.constant';

beforeAll(async () => {
  const maxWaitTime = 3 * 60 * 1000;
  const checkInterval = 1000;
  const startTime = Date.now();

  console.log('⏳ Waiting for server to be ready...');

  while (Date.now() - startTime < maxWaitTime) {
    try {
      await axios.get(`${SERVER_URL}/healthz`);
      console.log('✅ Server is ready for e2e tests');
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }
  }

  throw new Error('Server failed to start within 3 minutes');
});

afterAll(async () => {
  console.log('🧹 E2E tests completed');
});
