import { beforeEach, describe, expect, it, vi } from 'vitest';

const uploadFileMock = vi.fn();

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    uploadFile = uploadFileMock;
  },
}));

import {
  FileUploader,
  normalizeArtifactPath,
} from '@/cli/utilities/file/file-uploader';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

describe('normalizeArtifactPath', () => {
  it('should normalize windows separators to posix separators', () => {
    expect(normalizeArtifactPath('src\\logic-functions\\handler.mjs')).toBe(
      'src/logic-functions/handler.mjs',
    );
  });

  it('should keep posix separators unchanged', () => {
    expect(normalizeArtifactPath('src/logic-functions/handler.mjs')).toBe(
      'src/logic-functions/handler.mjs',
    );
  });
});

describe('FileUploader', () => {
  beforeEach(() => {
    uploadFileMock.mockReset();
    uploadFileMock.mockResolvedValue({ success: true, data: true });
  });

  it('should upload files with a posix built handler path', async () => {
    const fileUploader = new FileUploader({
      applicationUniversalIdentifier: 'app-id',
      appPath: '/app',
    });

    await fileUploader.uploadFile({
      builtPath: `${OUTPUT_DIR}/src\\logic-functions\\handler.mjs`,
      fileFolder: FileFolder.BuiltLogicFunction,
    });

    expect(uploadFileMock).toHaveBeenCalledWith({
      applicationUniversalIdentifier: 'app-id',
      builtHandlerPath: 'src/logic-functions/handler.mjs',
      fileFolder: FileFolder.BuiltLogicFunction,
      filePath: '/app/.twenty/output/src\\logic-functions\\handler.mjs',
    });
  });
});
