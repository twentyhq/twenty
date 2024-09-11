import { ConfigurableModuleBuilder } from '@nestjs/common';

import { FileStorageModuleOptions } from 'src/engine/core-modules/file-storage/interfaces';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<FileStorageModuleOptions>({
  moduleName: 'FileStorage',
})
  .setClassMethodName('forRoot')
  .build();
