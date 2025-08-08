import { Test, type TestingModule } from '@nestjs/testing';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { FileService } from './file.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('FileService', () => {
  let service: FileService;
  let fileStorageService: FileStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: FileStorageService,
          useValue: {
            copy: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {},
        },
        {
          provide: JwtWrapperService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    fileStorageService = module.get<FileStorageService>(FileStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('copyFileFromWorkspaceToWorkspace - should copy a file to a new workspace', async () => {
    const result = await service.copyFileFromWorkspaceToWorkspace(
      'workspaceId',
      'path/to/file',
      'newWorkspaceId',
    );

    expect(fileStorageService.copy).toHaveBeenCalledWith({
      from: {
        folderPath: 'workspace-workspaceId/path/to',
        filename: 'file',
      },
      to: {
        folderPath: 'workspace-newWorkspaceId/path/to',
        filename: 'mocked-uuid',
      },
    });

    expect(result).toEqual([
      'workspace-newWorkspaceId',
      'path/to',
      'mocked-uuid',
    ]);
  });
});
