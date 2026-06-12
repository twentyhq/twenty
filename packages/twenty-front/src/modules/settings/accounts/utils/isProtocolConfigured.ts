import { type ConnectionParametersInput } from '~/generated-metadata/graphql';

export const isProtocolConfigured = (
  config: ConnectionParametersInput,
): boolean => {
  return Boolean(config?.host?.trim() && config?.password?.trim());
};

export const isProtocolConfiguredForUpdate = (
  config: ConnectionParametersInput,
): boolean => {
  return Boolean(config?.host?.trim());
};
