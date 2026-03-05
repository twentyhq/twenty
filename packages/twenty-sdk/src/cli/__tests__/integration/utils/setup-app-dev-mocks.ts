import { vi } from 'vitest';

const mockApiService = {
  validateAuth: vi.fn().mockResolvedValue({ authValid: true, serverUp: true }),
  findOneApplication: vi.fn().mockResolvedValue({ success: true, data: null }),
  createApplication: vi
    .fn()
    .mockResolvedValue({ success: true, data: { id: 'mock-id' } }),
  generateApplicationToken: vi.fn().mockResolvedValue({
    success: true,
    data: {
      applicationAccessToken: { token: 'mock-access-token', expiresAt: '' },
      applicationRefreshToken: { token: 'mock-refresh-token', expiresAt: '' },
    },
  }),
  renewApplicationToken: vi.fn().mockResolvedValue({
    success: true,
    data: {
      applicationAccessToken: {
        token: 'mock-renewed-access-token',
        expiresAt: '',
      },
      applicationRefreshToken: {
        token: 'mock-renewed-refresh-token',
        expiresAt: '',
      },
    },
  }),
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
  syncApplication: vi.fn().mockResolvedValue({ success: true, data: true }),
  uploadFile: vi.fn().mockResolvedValue({ success: true, data: true }),
};

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    validateAuth = mockApiService.validateAuth;
    findOneApplication = mockApiService.findOneApplication;
    createApplication = mockApiService.createApplication;
    generateApplicationToken = mockApiService.generateApplicationToken;
    renewApplicationToken = mockApiService.renewApplicationToken;
    findApplicationRegistrationByUniversalIdentifier =
      mockApiService.findApplicationRegistrationByUniversalIdentifier;
    createApplicationRegistration =
      mockApiService.createApplicationRegistration;
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
