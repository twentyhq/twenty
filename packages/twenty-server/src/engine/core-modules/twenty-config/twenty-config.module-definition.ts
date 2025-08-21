import { ConfigurableModuleBuilder } from '@nestjs/common';

export const { ConfigurableModuleClass } = new ConfigurableModuleBuilder({
  moduleName: 'TwentyConfig',
})
  .setClassMethodName('forRoot')
  .build();
