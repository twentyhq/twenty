// Test setup for Fireflies app

// Mock global fetch for all tests
global.fetch = jest.fn();

// Setup test environment variables
process.env.FIREFLIES_WEBHOOK_SECRET = 'testsecret';
process.env.AUTO_CREATE_CONTACTS = 'true';
process.env.SERVER_URL = 'http://localhost:3000';
process.env.TWENTY_API_KEY = 'test-api-key';
process.env.LOG_LEVEL = 'silent';
process.env.CAPTURE_LOGS = 'false';

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
