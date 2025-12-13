import {
  CodeInterpreterDriverType,
  type CodeInterpreterModuleOptions,
} from './code-interpreter.interface';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const codeInterpreterModuleFactory = async (
  twentyConfigService: TwentyConfigService,
): Promise<CodeInterpreterModuleOptions> => {
  const driverType = twentyConfigService.get('CODE_INTERPRETER_TYPE');
  const timeoutMs = twentyConfigService.get('CODE_INTERPRETER_TIMEOUT_MS');

  switch (driverType) {
    case CodeInterpreterDriverType.LOCAL: {
      return {
        type: CodeInterpreterDriverType.LOCAL,
        options: { timeoutMs },
      };
    }
    case CodeInterpreterDriverType.E2B: {
      const apiKey = twentyConfigService.get('E2B_API_KEY');

      if (!apiKey) {
        throw new Error(
          'E2B_API_KEY is required when CODE_INTERPRETER_TYPE is E2B',
        );
      }

      return {
        type: CodeInterpreterDriverType.E2B,
        options: {
          apiKey,
          timeoutMs,
        },
      };
    }
    default:
      throw new Error(
        `Invalid code interpreter driver type (${driverType}), check your .env file`,
      );
  }
};

