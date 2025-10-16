import axios from 'axios';

// Global test setup
beforeAll(async () => {
  // Wait for server to be ready with 3-minute timeout
  const maxWaitTime = 3 * 60 * 1000; // 3 minutes in milliseconds
  const checkInterval = 1000; // Check every second
  const startTime = Date.now();
  
  console.log('⏳ Waiting for server to be ready...');
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      await axios.get('http://localhost:3000/healthz');
      console.log('✅ Server is ready for e2e tests');
      return;
    } catch (error) {
      // Server not ready yet, continue waiting
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }
  
  throw new Error('Server failed to start within 3 minutes');
});

afterAll(async () => {
  // Cleanup if needed
  console.log('🧹 E2E tests completed');
});