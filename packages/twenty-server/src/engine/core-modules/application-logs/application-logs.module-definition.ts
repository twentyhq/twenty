import { ConfigurableModuleBuilder } from '@nestjs/common';

import { type ApplicationLogsModuleOptions } from 'src/engine/core-modules/application-logs/interfaces/application-logs-module-options.type';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ApplicationLogsModuleOptions>({
  moduleName: 'ApplicationLogsModule',
})
  .setClassMethodName('forRoot')
  .build();
