import { isNonEmptyString } from '@sniptt/guards';
import { type ConnectionParametersInput } from '~/generated-metadata/graphql';

export const isProtocolConfigured = (
  config: ConnectionParametersInput,
): boolean => {
  return (
    isNonEmptyString(config?.host?.trim()) &&
    isNonEmptyString(config?.password?.trim())
  );
};

export const isProtocolConfiguredForUpdate = (
  config: ConnectionParametersInput,
): boolean => {
  return isNonEmptyString(config?.host?.trim());
};
