import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type SpeedLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/speed-limit-default-definition.type';

export const getSpeedLimitDefaultWindowMs = ({
  speedLimitDefault,
  getConfigValue,
}: {
  speedLimitDefault: SpeedLimitDefaultDefinition;
  getConfigValue: (key: NumericConfigVariableKey) => number;
}): number =>
  'windowSeconds' in speedLimitDefault
    ? speedLimitDefault.windowSeconds * 1000
    : getConfigValue(speedLimitDefault.windowMsConfigVariable);
