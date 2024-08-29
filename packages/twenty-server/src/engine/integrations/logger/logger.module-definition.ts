import { ConfigurableModuleBuilder } from '@nestjs/common';

import { LoggerModuleOptions } from './interfaces';

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
