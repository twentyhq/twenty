import { ConfigurableModuleBuilder } from '@nestjs/common';

import { type MessageQueueModuleOptions } from 'src/engine/core-modules/message-queue/interfaces';

export const {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<MessageQueueModuleOptions>()
  .setExtras(
    {
      isGlobal: true,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build();
