import { EnvironmentVariablesMaskingStrategies } from 'src/engine/core-modules/environment/enums/environment-variables-masking-strategies.enum';

type LastNCharsConfig = {
  strategy: EnvironmentVariablesMaskingStrategies.LAST_N_CHARS;
  chars: number;
};

type HidePasswordConfig = {
  strategy: EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD;
};

type MaskingConfigType = {
  APP_SECRET: LastNCharsConfig;
  PG_DATABASE_URL: HidePasswordConfig;
  REDIS_URL: HidePasswordConfig;
};

export const ENVIRONMENT_VARIABLES_MASKING_CONFIG: MaskingConfigType = {
  APP_SECRET: {
    strategy: EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
    chars: 5,
  },
  PG_DATABASE_URL: {
    strategy: EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD,
  },
  REDIS_URL: {
    strategy: EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD,
  },
} as const;
