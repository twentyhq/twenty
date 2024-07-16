import { ConfigurableModuleBuilder } from '@nestjs/common';

import { MessageQueueModuleOptions } from 'src/engine/integrations/message-queue/interfaces';

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
