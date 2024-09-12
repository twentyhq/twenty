import { Test, TestingModule } from '@nestjs/testing';

import { STORAGE_DRIVER } from 'src/engine/core-modules/file-storage/file-storage.constants';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: STORAGE_DRIVER,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
