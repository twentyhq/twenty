import { vi } from 'vitest';

const mockApiService = {
  validateAuth: vi.fn().mockResolvedValue({ authValid: true, serverUp: true }),
  generateApplicationToken: vi.fn().mockResolvedValue({
    success: true,
    data: {
      accessToken: { token: 'mock-access-token', expiresAt: '' },
      refreshToken: { token: 'mock-refresh-token', expiresAt: '' },
    },
  }),
  refreshToken: vi.fn().mockResolvedValue('mock-renewed-access-token'),
  findApplicationRegistrationByUniversalIdentifier: vi
    .fn()
    .mockResolvedValue({ success: true, data: null }),
  createApplicationRegistration: vi.fn().mockResolvedValue({
    success: true,
    data: {
      applicationRegistration: {
        id: 'mock-registration-id',
        oAuthClientId: 'mock-client-id',
      },
      clientSecret: 'mock-client-secret',
    },
  }),
  createDevelopmentApplication: vi.fn().mockResolvedValue({
    success: true,
    data: { id: 'mock-app-id', universalIdentifier: 'mock-uid' },
  }),
  syncApplication: vi.fn().mockResolvedValue({ success: true, data: true }),
  uploadFile: vi.fn().mockResolvedValue({ success: true, data: true }),
};

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    validateAuth = mockApiService.validateAuth;
    generateApplicationToken = mockApiService.generateApplicationToken;
    refreshToken = mockApiService.refreshToken;
    findApplicationRegistrationByUniversalIdentifier =
      mockApiService.findApplicationRegistrationByUniversalIdentifier;
    createApplicationRegistration =
      mockApiService.createApplicationRegistration;
    createDevelopmentApplication = mockApiService.createDevelopmentApplication;
    syncApplication = mockApiService.syncApplication;
    uploadFile = mockApiService.uploadFile;
  },
}));

vi.mock('@/cli/utilities/file/file-uploader', () => ({
  FileUploader: class {
    uploadFile = vi.fn().mockResolvedValue({ success: true, data: true });
  },
}));

vi.mock('@/cli/utilities/dev/ui/components/dev-ui', () => ({
  renderDevUI: vi.fn().mockResolvedValue({ unmount: vi.fn() }),
}));
