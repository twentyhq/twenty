import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

export type NumericConfigVariableKey = {
  [Key in keyof ConfigVariables]-?: ConfigVariables[Key] extends number
    ? Key
    : never;
}[keyof ConfigVariables];
