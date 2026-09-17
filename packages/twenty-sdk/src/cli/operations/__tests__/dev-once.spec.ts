import { EXPECTED_MANIFEST } from '@/cli/__tests__/apps/minimal-app/__integration__/app-dev/expected-manifest';
import { FileFolder } from 'twenty-shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockValidateAuth = vi.fn();
const mockCreateDevelopmentApplication = vi.fn();
const mockSyncApplication = vi.fn();

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    validateAuth = mockValidateAuth;
    createDevelopmentApplication = mockCreateDevelopmentApplication;
    syncApplication = mockSyncApplication;
  },
}));

const mockEnsureAppRegistration = vi.fn();

vi.mock('@/cli/utilities/auth', () => ({
  ensureAppAccessTokenIsValidOrRefresh: vi.fn(),
  ensureAppRegistration: (...args: unknown[]) =>
    mockEnsureAppRegistration(...args),
}));

const mockBuildAndValidateManifest = vi.fn();

vi.mock('@/cli/utilities/build/manifest/build-and-validate-manifest', () => ({
  buildAndValidateManifest: (...args: unknown[]) =>
    mockBuildAndValidateManifest(...args),
}));

const mockBuildApplication = vi.fn();

vi.mock('@/cli/utilities/build/common/build-application', () => ({
  buildApplication: (...args: unknown[]) => mockBuildApplication(...args),
}));

vi.mock('@/cli/utilities/build/common/typecheck-plugin', () => ({
  runTypecheck: vi.fn().mockResolvedValue([]),
}));

vi.mock(
  '@/cli/utilities/translations/compile-application-translations',
  () => ({
    compileApplicationTranslations: vi.fn().mockResolvedValue({}),
  }),
);

vi.mock('@/cli/utilities/build/manifest/manifest-writer', () => ({
  writeManifestToOutput: vi.fn().mockResolvedValue(undefined),
}));

const mockUploadFiles = vi.fn();

vi.mock('@/cli/utilities/file/file-uploader', () => ({
  FileUploader: class {
    uploadFiles = mockUploadFiles;
  },
}));

// unrelated to this test; avoids loading twenty-client-sdk's generated (unbuilt) subpath export
vi.mock('@/cli/utilities/client/client-service', () => ({
  ClientService: class {
    generateCoreClient = vi.fn();
  },
}));

const { appDevOnce } = await import('@/cli/operations/dev-once');

describe('appDevOnce', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockValidateAuth.mockResolvedValue({ serverUp: true, authValid: true });

    mockBuildAndValidateManifest.mockResolvedValue({
      success: true,
      manifest: EXPECTED_MANIFEST,
      filePaths: {},
      warnings: [],
    });

    mockBuildApplication.mockResolvedValue({
      builtFileInfos: new Map([
        [
          'front-components/main-page.tsx',
          {
            checksum: 'checksum',
            builtPath: 'front-components/main-page.tsx',
            fileFolder: FileFolder.BuiltFrontComponent,
          },
        ],
      ]),
    });

    mockEnsureAppRegistration.mockResolvedValue({
      clientId: 'client-id',
      clientSecret: 'client-secret',
      isNewRegistration: true,
    });

    mockCreateDevelopmentApplication.mockResolvedValue({
      success: true,
      data: { id: 'dev-app-id' },
    });

    mockSyncApplication.mockResolvedValue({
      success: true,
      data: { actions: [] },
    });
  });

  it('still syncs metadata even when a file upload fails, instead of skipping it silently', async () => {
    mockUploadFiles.mockResolvedValue([
      {
        builtPath: 'front-components/main-page.tsx',
        error: 'storage refused',
      },
    ]);

    const result = await appDevOnce({ appPath: '/fake/app', force: true });

    expect(mockSyncApplication).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.message).toContain('storage refused');
    }
  });
});
