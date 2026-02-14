import { vi } from 'vitest';

const mockApiService = {
  validateAuth: vi.fn().mockResolvedValue({ authValid: true, serverUp: true }),
  checkApplicationExist: vi
    .fn()
    .mockResolvedValue({ success: true, data: false }),
  findOneApplicationByUniversalIdentifier: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'mock-id',
      universalIdentifier: '00000000-0000-0000-0000-000000000001',
    },
  }),
  createApplication: vi
    .fn()
    .mockResolvedValue({ success: true, data: { id: 'mock-id' } }),
  generateApplicationTokenPair: vi.fn().mockResolvedValue({
    success: true,
    data: {
      applicationAccessToken: {
        token: 'mock-application-access-token',
        expiresAt: '2099-01-01T00:00:00.000Z',
      },
      applicationRefreshToken: {
        token: 'mock-application-refresh-token',
        expiresAt: '2099-01-01T00:00:00.000Z',
      },
    },
  }),
  renewApplicationToken: vi.fn().mockResolvedValue({
    success: true,
    data: {
      applicationAccessToken: {
        token: 'mock-renewed-application-access-token',
        expiresAt: '2099-01-01T00:00:00.000Z',
      },
      applicationRefreshToken: {
        token: 'mock-renewed-application-refresh-token',
        expiresAt: '2099-01-01T00:00:00.000Z',
      },
    },
  }),
  syncApplication: vi.fn().mockResolvedValue({ success: true, data: true }),
  uploadFile: vi.fn().mockResolvedValue({ success: true, data: true }),
};

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    validateAuth = mockApiService.validateAuth;
    checkApplicationExist = mockApiService.checkApplicationExist;
    findOneApplicationByUniversalIdentifier =
      mockApiService.findOneApplicationByUniversalIdentifier;
    createApplication = mockApiService.createApplication;
    generateApplicationTokenPair = mockApiService.generateApplicationTokenPair;
    renewApplicationToken = mockApiService.renewApplicationToken;
    syncApplication = mockApiService.syncApplication;
    uploadFile = mockApiService.uploadFile;
  },
}));

vi.mock('@/cli/utilities/file/file-uploader', () => ({
  FileUploader: class {
    uploadFile = vi.fn().mockResolvedValue({ success: true, data: true });
  },
}));

vi.mock('@/cli/utilities/dev/dev-ui', () => ({
  renderDevUI: vi.fn().mockResolvedValue({ unmount: vi.fn() }),
}));
