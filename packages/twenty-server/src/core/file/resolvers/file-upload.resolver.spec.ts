import { Test, TestingModule } from '@nestjs/testing';

import { FileUploadService } from 'src/core/file/services/file-upload.service';

import { FileUploadResolver } from './file-upload.resolver';

describe('FileUploadResolver', () => {
  let resolver: FileUploadResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadResolver,
        {
          provide: FileUploadService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<FileUploadResolver>(FileUploadResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
