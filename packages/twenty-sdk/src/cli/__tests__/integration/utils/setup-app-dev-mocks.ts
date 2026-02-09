import { vi } from 'vitest';

const mockApiService = {
  validateAuth: vi.fn().mockResolvedValue({ authValid: true, serverUp: true }),
  checkApplicationExist: vi
    .fn()
    .mockResolvedValue({ success: true, data: false }),
  createApplication: vi
    .fn()
    .mockResolvedValue({ success: true, data: { id: 'mock-id' } }),
  syncApplication: vi.fn().mockResolvedValue({ success: true, data: true }),
  uploadFile: vi.fn().mockResolvedValue({ success: true, data: true }),
};

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    validateAuth = mockApiService.validateAuth;
    checkApplicationExist = mockApiService.checkApplicationExist;
    createApplication = mockApiService.createApplication;
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
