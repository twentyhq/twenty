import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';

import { FileController } from './file.controller';

describe('FileController', () => {
  let controller: FileController;
  const mock_FilePathGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(FilePathGuard)
      .useValue(mock_FilePathGuard)
      .compile();

    controller = module.get<FileController>(FileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
