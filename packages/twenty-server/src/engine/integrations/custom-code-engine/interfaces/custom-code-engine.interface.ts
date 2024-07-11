import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

export enum CustomCodeEngineDriverType {
  Lambda = 'lambda',
  Local = 'local',
}

export interface LocalDriverFactoryOptions {
  type: CustomCodeEngineDriverType.Local;
  options: {
    fileStorageService: FileStorageService;
    fileUploadService: FileUploadService;
  };
}

export type CustomCodeEngineModuleOptions = LocalDriverFactoryOptions;

export type CustomCodeEngineModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => CustomCodeEngineModuleOptions | Promise<CustomCodeEngineModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
