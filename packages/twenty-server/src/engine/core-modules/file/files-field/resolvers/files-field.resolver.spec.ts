import { Test, type TestingModule } from '@nestjs/testing';

jest.mock('graphql-upload/GraphQLUpload.mjs', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('graphql-upload/processRequest.mjs', () => ({
  __esModule: true,
  FileUpload: {},
}));

import { FilesFieldService } from 'src/engine/core-modules/file/files-field/files-field.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

import { FilesFieldResolver } from './files-field.resolver';

describe('FilesFieldResolver', () => {
  let resolver: FilesFieldResolver;
  let filesFieldService: FilesFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesFieldResolver,
        {
          provide: FilesFieldService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<FilesFieldResolver>(FilesFieldResolver);
    filesFieldService = module.get<FilesFieldService>(FilesFieldService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should upload file', async () => {
    const mockFileEntity = {
      id: 'test-file-id',
      path: 'files-field/test-file.pdf',
      size: 1024,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isStaticAsset: false,
      settings: {
        isTemporaryFile: true,
        toDelete: false,
      },
    };

    jest
      .spyOn(filesFieldService, 'uploadFile')
      .mockResolvedValue(mockFileEntity as any);

    const mockWorkspace = {
      id: 'workspace-id',
      workspaceCustomApplicationId: 'app-id',
    };

    const mockFileUpload = {
      createReadStream: jest.fn(() => {
        const { Readable } = require('stream');
        const stream = new Readable();

        stream.push('file content');
        stream.push(null);

        return stream;
      }),
      filename: 'test-file.pdf',
      mimetype: 'application/pdf',
    };

    const result = await resolver.uploadFilesFieldFile(
      mockWorkspace as any,
      mockFileUpload as any,
    );

    expect(result).toEqual(mockFileEntity);
    expect(filesFieldService.uploadFile).toHaveBeenCalledWith({
      file: expect.any(Buffer),
      filename: 'test-file.pdf',
      declaredMimeType: 'application/pdf',
      workspaceId: 'workspace-id',
      applicationId: 'app-id',
    });
  });
});
