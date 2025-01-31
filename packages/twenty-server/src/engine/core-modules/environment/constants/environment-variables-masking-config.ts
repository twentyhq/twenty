import { EnvironmentVariablesMaskingStrategies } from 'src/engine/core-modules/environment/enums/environment-variables-masking-strategies.enum';

type LastNCharsConfig = {
  strategy: EnvironmentVariablesMaskingStrategies.LAST_N_CHARS;
  chars: number;
};

type HidePasswordConfig = {
  strategy: EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD;
};

export const ENVIRONMENT_VARIABLES_MASKING_CONFIG = {
  APP_SECRET: {
    strategy: EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
    chars: 5,
  } as LastNCharsConfig,

  PG_DATABASE_URL: {
    strategy: EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD,
  } as HidePasswordConfig,

  REDIS_URL: {
    strategy: EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD,
  } as HidePasswordConfig,
} as const;
