import { ConfigurableModuleBuilder } from '@nestjs/common';

import { type LoggerModuleOptions } from 'src/engine/core-modules/logger/interfaces';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<LoggerModuleOptions>({
  moduleName: 'LoggerService',
})
  .setClassMethodName('forRoot')
  .build();
