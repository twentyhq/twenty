import { type CanActivate, Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';
import { pipeline } from 'node:stream/promises';

import { FileFolder } from 'twenty-shared/types';

jest.mock('node:stream/promises', () => ({
  pipeline: jest.fn(),
}));

import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import { FileByIdGuard } from 'src/engine/core-modules/file/guards/file-by-id.guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

import { FileController } from './file.controller';

const createMockStream = (): Readable => {
  const stream = new Readable();

  stream.push('file content');
  stream.push(null);

  return stream;
};

const createMockResponse = ({
  headersSent = false,
}: { headersSent?: boolean } = {}) => ({
  setHeader: jest.fn(),
  redirect: jest.fn(),
  headersSent,
  destroy: jest.fn(),
});

const mockPipeline = jest.mocked(pipeline);

describe('FileController', () => {
  let controller: FileController;
  let fileService: FileService;
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
            getFileStreamById: jest.fn(),
            getFileStreamByPath: jest.fn(),
            getFileResponseById: jest.fn(),
          },
        },
      ],
    })
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

    // Default to a resolved pipeline so happy-path tests don't have to wire it up.
    mockPipeline.mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFileById', () => {
    it('should 302 redirect when presigned URL is available', async () => {
      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue({
        type: 'redirect',
        presignedUrl: 'https://s3.example.com/file?signed=abc',
      });

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      await controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.Workflow,
        'file-123',
      );

      expect(fileService.getFileResponseById).toHaveBeenCalledWith({
        fileId: 'file-123',
        workspaceId: 'workspace-id',
        fileFolder: FileFolder.Workflow,
      });
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'https://s3.example.com/file?signed=abc',
      );
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should stream with headers when no presigned URL (local driver)', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue({
        type: 'stream',
        stream: mockStream,
        mimeType: 'image/png',
      });

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      await controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.CorePicture,
        'file-123',
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'image/png',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline',
      );
      expect(mockPipeline).toHaveBeenCalledWith(mockStream, mockResponse);
    });

    it('should force attachment disposition for non-safe MIME types', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue({
        type: 'stream',
        stream: mockStream,
        mimeType: 'text/html',
      });

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      await controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.Workflow,
        'file-123',
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/html',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment',
      );
    });

    it('should throw FILE_NOT_FOUND when the service yields null', async () => {
      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue(null);

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

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

    it('should throw INTERNAL_SERVER_ERROR without leaking the underlying message, and log the original error', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const underlyingError = new Error(
        'Storage unavailable: postgres://secret-host:5432',
      );

      jest
        .spyOn(fileService, 'getFileResponseById')
        .mockRejectedValue(underlyingError);

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      const promise = controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.Workflow,
        'file-456',
      );

      await expect(promise).rejects.toThrow(
        new FileException(
          'Error retrieving file',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
      await expect(promise).rejects.not.toThrow(/secret-host/);

      expect(loggerSpy).toHaveBeenCalledWith(
        'getFileResponseById failed unexpectedly',
        { error: underlyingError },
      );
    });

    it('should throw INTERNAL_SERVER_ERROR when the stream errors before headers are sent', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue({
        type: 'stream',
        stream: mockStream,
        mimeType: 'image/png',
      });

      mockPipeline.mockRejectedValue(new Error('source backend exploded'));

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse({ headersSent: false }) as any;

      await expect(
        controller.getFileById(
          mockResponse,
          mockRequest,
          FileFolder.CorePicture,
          'file-123',
        ),
      ).rejects.toThrow(
        new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(mockResponse.destroy).not.toHaveBeenCalled();
    });

    it('should destroy the response without throwing when the stream errors after headers are sent', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue({
        type: 'stream',
        stream: mockStream,
        mimeType: 'image/png',
      });

      mockPipeline.mockRejectedValue(new Error('socket reset mid-flight'));

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse({ headersSent: true }) as any;

      // No throw expected — once headers are out, the controller cannot honestly
      // switch to a 500 response, so it tears the socket down instead.
      await controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.CorePicture,
        'file-123',
      );

      expect(mockResponse.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPublicAssets', () => {
    it('should call fileService.getFileStreamByPath and pipe with headers', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/png',
      });

      const mockRequest = {
        params: { path: ['images', 'logo.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

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
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'image/png',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline',
      );
      expect(mockPipeline).toHaveBeenCalledWith(mockStream, mockResponse);
    });

    it('should handle single-segment path', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/x-icon',
      });

      const mockRequest = {
        params: { path: ['favicon.ico'] },
      } as any;

      const mockResponse = createMockResponse() as any;

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

    it('should throw FILE_NOT_FOUND when the service yields null', async () => {
      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue(null);

      const mockRequest = {
        params: { path: ['missing-asset.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

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

    it('should throw INTERNAL_SERVER_ERROR without leaking the underlying message, and log the original error', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const underlyingError = new Error(
        'Connection refused: postgres://secret-host:5432',
      );

      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockRejectedValue(underlyingError);

      const mockRequest = {
        params: { path: ['broken-asset.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      const promise = controller.getPublicAssets(
        mockResponse,
        mockRequest,
        'workspace-id',
        'app-id',
      );

      await expect(promise).rejects.toThrow(
        new FileException(
          'Error retrieving file',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
      await expect(promise).rejects.not.toThrow(/secret-host/);

      expect(loggerSpy).toHaveBeenCalledWith(
        'getFileStreamByPath failed unexpectedly',
        { error: underlyingError },
      );
    });

    it('should throw INTERNAL_SERVER_ERROR when the stream errors before headers are sent', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/png',
      });

      mockPipeline.mockRejectedValue(new Error('source backend exploded'));

      const mockRequest = {
        params: { path: ['mid-stream-error.png'] },
      } as any;

      const mockResponse = createMockResponse({ headersSent: false }) as any;

      await expect(
        controller.getPublicAssets(
          mockResponse,
          mockRequest,
          'workspace-id',
          'app-id',
        ),
      ).rejects.toThrow(
        new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(mockResponse.destroy).not.toHaveBeenCalled();
    });

    it('should destroy the response without throwing when the stream errors after headers are sent', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/png',
      });

      mockPipeline.mockRejectedValue(new Error('socket reset mid-flight'));

      const mockRequest = {
        params: { path: ['mid-stream-after-headers.png'] },
      } as any;

      const mockResponse = createMockResponse({ headersSent: true }) as any;

      // No throw expected — once headers are out, the controller cannot honestly
      // switch to a 500 response, so it tears the socket down instead.
      await controller.getPublicAssets(
        mockResponse,
        mockRequest,
        'workspace-id',
        'app-id',
      );

      expect(mockResponse.destroy).toHaveBeenCalledTimes(1);
    });
  });
});
