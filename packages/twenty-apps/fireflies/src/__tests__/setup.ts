// Test setup for Fireflies app
// This file is run before each test suite

// Mock global fetch for all tests
global.fetch = jest.fn();

// Setup default environment variables for tests
process.env.FIREFLIES_WEBHOOK_SECRET = 'testsecret';
process.env.AUTO_CREATE_CONTACTS = 'true';
process.env.SERVER_URL = 'http://localhost:3000';
process.env.TWENTY_API_KEY = 'test-api-key';

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});