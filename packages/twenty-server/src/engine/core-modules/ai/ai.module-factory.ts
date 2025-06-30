import { AiDriver } from 'src/engine/core-modules/ai/interfaces/ai.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const aiModuleFactory = (twentyConfigService: TwentyConfigService) => {
  const driver = twentyConfigService.get('AI_DRIVER');

  switch (driver) {
    case AiDriver.OPENAI: {
      return { type: AiDriver.OPENAI };
    }
    default: {
      // Default to OpenAI driver if no driver is specified
      return { type: AiDriver.OPENAI };
    }
  }
};
