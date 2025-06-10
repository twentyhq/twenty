import { Test, TestingModule } from '@nestjs/testing';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
          provide: TwentyConfigService,
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
