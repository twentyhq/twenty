import { type CanActivate } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { FilesFieldService } from 'src/engine/core-modules/file/files-field/files-field.service';
import { FilesFieldGuard } from 'src/engine/core-modules/file/files-field/guards/files-field.guard';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';

import { FilesFieldController } from './files-field.controller';

describe('FilesFieldController', () => {
  let controller: FilesFieldController;
  let filesFieldService: FilesFieldService;
  const mockFilesFieldGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesFieldController],
      providers: [
        {
          provide: FilesFieldService,
          useValue: {
            getFileStream: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(FilesFieldGuard)
      .useValue(mockFilesFieldGuard)
      .overrideFilter(FileApiExceptionFilter)
      .useValue({})
      .compile();

    controller = module.get<FilesFieldController>(FilesFieldController);
    filesFieldService = module.get<FilesFieldService>(FilesFieldService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should stream file by id', async () => {
    const mockStream = new Readable();

    mockStream.push('file content');
    mockStream.push(null);
    mockStream.pipe = jest.fn();

    jest
      .spyOn(filesFieldService, 'getFileStream')
      .mockResolvedValue(mockStream);

    const fileId = 'test-file-id';
    const workspaceId = 'workspace-id';

    const mockRequest = {
      workspaceId,
    } as any;

    const mockResponse = {} as any;

    await controller.getFileById(mockResponse, mockRequest, fileId);

    expect(filesFieldService.getFileStream).toHaveBeenCalledWith({
      fileId,
      workspaceId,
    });
    expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle stream errors', async () => {
    const mockStream = new Readable();
    const errorHandler = jest.fn();

    mockStream.push('file content');
    mockStream.push(null);
    mockStream.pipe = jest.fn();
    mockStream.on = jest.fn((event, handler) => {
      if (event === 'error') {
        errorHandler.mockImplementation(handler);
      }

      return mockStream;
    });

    jest
      .spyOn(filesFieldService, 'getFileStream')
      .mockResolvedValue(mockStream);

    const fileId = 'test-file-id';
    const workspaceId = 'workspace-id';

    const mockRequest = {
      workspaceId,
    } as any;

    const mockResponse = {} as any;

    await controller.getFileById(mockResponse, mockRequest, fileId);

    expect(mockStream.on).toHaveBeenCalledWith('error', expect.any(Function));
  });
});
