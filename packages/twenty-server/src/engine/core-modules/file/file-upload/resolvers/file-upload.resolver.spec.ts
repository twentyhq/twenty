import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

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
        {
          provide: EnvironmentService,
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
