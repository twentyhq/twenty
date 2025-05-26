import { DynamicModule, Global } from '@nestjs/common';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Global()
export class FileStorageModule {
  static forRoot(): DynamicModule {
    return {
      module: FileStorageModule,
      imports: [TwentyConfigModule],
      providers: [FileStorageService],
      exports: [FileStorageService],
    };
  }
}
