import axios from 'axios';

// Global test setup
beforeAll(async () => {
  // Server should already be running due to Nx dependencies
  // Just verify it's ready
  try {
    await axios.get('http://localhost:3000/healthz');
    console.log('✅ Server is ready for e2e tests');
  } catch (error) {
    throw new Error('Server is not ready for e2e tests');
  }
});

afterAll(async () => {
  // Cleanup if needed
  console.log('🧹 E2E tests completed');
});