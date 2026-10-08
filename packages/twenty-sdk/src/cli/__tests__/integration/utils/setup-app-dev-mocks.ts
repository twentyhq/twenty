import { vi } from 'vitest';

export const mockApiService = {
  validateAuth: vi.fn().mockResolvedValue({ authValid: true, serverUp: true }),
  getWorkspaceFrontendUrl: vi.fn().mockResolvedValue('http://localhost:3000'),
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
    },
  }),
  createDevelopmentApplication: vi.fn().mockResolvedValue({
    success: true,
    data: { id: 'mock-app-id', universalIdentifier: 'mock-uid' },
  }),
  syncApplication: vi.fn().mockResolvedValue({ success: true, data: true }),
  getApplicationCoreGraphqlSchema: vi
    .fn()
    .mockResolvedValue({ success: true, data: 'mock-core-schema' }),
};

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    validateAuth = mockApiService.validateAuth;
    getWorkspaceFrontendUrl = mockApiService.getWorkspaceFrontendUrl;
    refreshToken = mockApiService.refreshToken;
    findApplicationRegistrationByUniversalIdentifier =
      mockApiService.findApplicationRegistrationByUniversalIdentifier;
    createApplicationRegistration =
      mockApiService.createApplicationRegistration;
    createDevelopmentApplication = mockApiService.createDevelopmentApplication;
    syncApplication = mockApiService.syncApplication;
    getApplicationCoreGraphqlSchema =
      mockApiService.getApplicationCoreGraphqlSchema;
  },
}));

vi.mock('@/cli/utilities/file/file-uploader', () => ({
  FileUploader: class {
    uploadFiles = vi.fn().mockResolvedValue([]);
  },
}));

vi.mock('@/cli/utilities/auth', () => ({
  ensureAppRegistration: vi.fn().mockResolvedValue({
    isNewRegistration: true,
  }),
}));

vi.mock('@/cli/utilities/client/client-service', () => ({
  ClientService: class {
    generateCoreClient = vi.fn().mockResolvedValue(undefined);
  },
}));

vi.mock('@/cli/utilities/dev/ui/components/dev-ui', () => ({
  renderDevUI: vi.fn().mockResolvedValue({ unmount: vi.fn() }),
}));
