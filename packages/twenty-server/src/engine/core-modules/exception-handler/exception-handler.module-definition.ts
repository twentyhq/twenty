import { ConfigurableModuleBuilder } from '@nestjs/common';

import { type ExceptionHandlerModuleOptions } from 'src/engine/core-modules/exception-handler/interfaces';

export const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<ExceptionHandlerModuleOptions>({
    moduleName: 'ExceptionHandlerModule',
  })
    .setClassMethodName('forRoot')
    .build();
