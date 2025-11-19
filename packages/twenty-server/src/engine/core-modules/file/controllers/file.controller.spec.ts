import { type CanActivate } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';

import { FileController } from './file.controller';

describe('FileController', () => {
  let controller: FileController;
  let fileService: FileService;
  const mock_FilePathGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            getFileStream: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(FilePathGuard)
      .useValue(mock_FilePathGuard)
      .overrideFilter(FileApiExceptionFilter)
      .useValue({})
      .compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should extract folder, token and filename from route parameters', async () => {
    const mockStream = new Readable();

    mockStream.push('file content');
    mockStream.push(null);
    mockStream.pipe = jest.fn();

    jest.spyOn(fileService, 'getFileStream').mockResolvedValue(mockStream);

    const mockRequest = {
      params: {
        folder: 'attachment',
        token: 'test-token',
        filename: 'test-file.csv',
      },
      workspaceId: 'workspace-id',
    } as any;

    const mockResponse = {} as any;

    await controller.getFile(
      'attachment',
      'test-file.csv',
      mockResponse,
      mockRequest,
    );

    expect(fileService.getFileStream).toHaveBeenCalledWith(
      'attachment',
      'test-file.csv',
      'workspace-id',
    );
  });
});
