import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import {
  CodeInterpreterDriverType,
  type CodeInterpreterModuleOptions,
} from './code-interpreter.interface';

export const codeInterpreterModuleFactory = async (
  twentyConfigService: TwentyConfigService,
): Promise<CodeInterpreterModuleOptions> => {
  const driverType = twentyConfigService.get('CODE_INTERPRETER_TYPE');
  const timeoutMs = twentyConfigService.get('CODE_INTERPRETER_TIMEOUT_MS');

  switch (driverType) {
    case CodeInterpreterDriverType.LOCAL: {
      const nodeEnv = twentyConfigService.get('NODE_ENV');

      if (nodeEnv === NodeEnvironment.PRODUCTION) {
        return {
          type: CodeInterpreterDriverType.DISABLED,
          options: {
            reason:
              'LOCAL code interpreter driver is not allowed in production. Use E2B driver instead by setting CODE_INTERPRETER_TYPE=E2B and providing E2B_API_KEY.',
          },
        };
      }

      return {
        type: CodeInterpreterDriverType.LOCAL,
        options: { timeoutMs },
      };
    }
    case CodeInterpreterDriverType.E_2_B: {
      const apiKey = twentyConfigService.get('E2B_API_KEY');

      if (!apiKey) {
        throw new Error(
          'E2B_API_KEY is required when CODE_INTERPRETER_TYPE is E2B',
        );
      }

      return {
        type: CodeInterpreterDriverType.E_2_B,
        options: {
          apiKey,
          timeoutMs,
        },
      };
    }
    case CodeInterpreterDriverType.DISABLED: {
      return {
        type: CodeInterpreterDriverType.DISABLED,
        options: {
          reason:
            'Code interpreter is disabled. Set CODE_INTERPRETER_TYPE to LOCAL (development only) or E2B to enable it.',
        },
      };
    }
    default:
      throw new Error(
        `Invalid code interpreter driver type (${driverType}), check your .env file`,
      );
  }
};
