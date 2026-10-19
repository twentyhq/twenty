import { isNonEmptyString } from '@sniptt/guards';

const FALSE_VALUES = new Set(['0', 'false']);

export const isContinuousIntegration = () => {
  const continuousIntegration = process.env.CI;

  return (
    isNonEmptyString(continuousIntegration) &&
    !FALSE_VALUES.has(continuousIntegration.toLowerCase())
  );
};
