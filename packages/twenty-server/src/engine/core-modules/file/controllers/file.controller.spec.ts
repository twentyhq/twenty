import { type CanActivate } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileByIdGuard } from 'src/engine/core-modules/file/guards/file-by-id.guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

import { FileController } from './file.controller';

const createMockStream = (): Readable => {
  const stream = new Readable();

  stream.push('file content');
  stream.push(null);
  stream.pipe = jest.fn();

  return stream;
};

describe('FileController', () => {
  let controller: FileController;
  let fileService: FileService;
  const mock_FilePathGuard: CanActivate = { canActivate: jest.fn(() => true) };
  const mock_FileByIdGuard: CanActivate = { canActivate: jest.fn(() => true) };
  const mock_PublicEndpointGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };
  const mock_NoPermissionGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            getFileStream: jest.fn(),
            getFileStreamById: jest.fn(),
            getFileStreamByPath: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(FilePathGuard)
      .useValue(mock_FilePathGuard)
      .overrideGuard(FileByIdGuard)
      .useValue(mock_FileByIdGuard)
      .overrideGuard(PublicEndpointGuard)
      .useValue(mock_PublicEndpointGuard)
      .overrideGuard(NoPermissionGuard)
      .useValue(mock_NoPermissionGuard)
      .overrideFilter(FileApiExceptionFilter)
      .useValue({})
      .compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFile', () => {
    it('should extract folder, token and filename from 3-segment path', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileStream').mockResolvedValue(mockStream);

      const mockRequest = {
        path: '/files/attachment/test-token/test-file.csv',
        workspaceId: 'workspace-id',
      } as any;

      const mockResponse = {} as any;

      await controller.getFile(mockResponse, mockRequest);

      expect(fileService.getFileStream).toHaveBeenCalledWith(
        'attachment',
        'test-file.csv',
        'workspace-id',
      );
    });

    it('should extract folder with size, token and filename from 4-segment path', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileStream').mockResolvedValue(mockStream);

      const mockRequest = {
        path: '/files/profile-picture/original/test-token/avatar.jpg',
        workspaceId: 'workspace-id',
      } as any;

      const mockResponse = {} as any;

      await controller.getFile(mockResponse, mockRequest);

      expect(fileService.getFileStream).toHaveBeenCalledWith(
        'profile-picture/original',
        'avatar.jpg',
        'workspace-id',
      );
    });
  });

  describe('getFileById', () => {
    it('should call fileService.getFileStreamById and pipe the result', async () => {
      const mockStream = createMockStream();

      jest
        .spyOn(fileService, 'getFileStreamById')
        .mockResolvedValue(mockStream);

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = {} as any;

      await controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.CorePicture,
        'file-123',
      );

      expect(fileService.getFileStreamById).toHaveBeenCalledWith({
        fileId: 'file-123',
        workspaceId: 'workspace-id',
        fileFolder: FileFolder.CorePicture,
      });
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should throw FileException with FILE_NOT_FOUND when file is not found', async () => {
      jest
        .spyOn(fileService, 'getFileStreamById')
        .mockRejectedValue(
          new FileStorageException(
            'File not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          ),
        );

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = {} as any;

      await expect(
        controller.getFileById(
          mockResponse,
          mockRequest,
          FileFolder.FilesField,
          'missing-file',
        ),
      ).rejects.toThrow(
        new FileException('File not found', FileExceptionCode.FILE_NOT_FOUND),
      );
    });

    it('should throw FileException with INTERNAL_SERVER_ERROR for unexpected errors', async () => {
      jest
        .spyOn(fileService, 'getFileStreamById')
        .mockRejectedValue(new Error('Storage unavailable'));

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = {} as any;

      await expect(
        controller.getFileById(
          mockResponse,
          mockRequest,
          FileFolder.Workflow,
          'file-456',
        ),
      ).rejects.toThrow(
        new FileException(
          'Error retrieving file: Storage unavailable',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getPublicAssets', () => {
    it('should call fileService.getFileStreamByPath and pipe the result', async () => {
      const mockStream = createMockStream();

      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockResolvedValue(mockStream);

      const mockRequest = {
        params: { path: ['images', 'logo.png'] },
      } as any;

      const mockResponse = {} as any;

      await controller.getPublicAssets(
        mockResponse,
        mockRequest,
        'workspace-id',
        'app-id',
      );

      expect(fileService.getFileStreamByPath).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        applicationId: 'app-id',
        fileFolder: FileFolder.PublicAsset,
        filepath: 'images/logo.png',
      });
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle single-segment path', async () => {
      const mockStream = createMockStream();

      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockResolvedValue(mockStream);

      const mockRequest = {
        params: { path: ['favicon.ico'] },
      } as any;

      const mockResponse = {} as any;

      await controller.getPublicAssets(
        mockResponse,
        mockRequest,
        'workspace-id',
        'app-id',
      );

      expect(fileService.getFileStreamByPath).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        applicationId: 'app-id',
        fileFolder: FileFolder.PublicAsset,
        filepath: 'favicon.ico',
      });
    });

    it('should throw FileException with FILE_NOT_FOUND when asset is not found', async () => {
      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockRejectedValue(
          new FileStorageException(
            'File not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          ),
        );

      const mockRequest = {
        params: { path: ['missing-asset.png'] },
      } as any;

      const mockResponse = {} as any;

      await expect(
        controller.getPublicAssets(
          mockResponse,
          mockRequest,
          'workspace-id',
          'app-id',
        ),
      ).rejects.toThrow(
        new FileException('File not found', FileExceptionCode.FILE_NOT_FOUND),
      );
    });

    it('should throw FileException with INTERNAL_SERVER_ERROR for unexpected errors', async () => {
      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockRejectedValue(new Error('Connection refused'));

      const mockRequest = {
        params: { path: ['broken-asset.png'] },
      } as any;

      const mockResponse = {} as any;

      await expect(
        controller.getPublicAssets(
          mockResponse,
          mockRequest,
          'workspace-id',
          'app-id',
        ),
      ).rejects.toThrow(
        new FileException(
          'Error retrieving file: Connection refused',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
