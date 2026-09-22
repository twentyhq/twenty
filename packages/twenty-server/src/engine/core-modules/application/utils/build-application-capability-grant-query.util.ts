import {
  APPLICATION_CAPABILITIES,
  type ApplicationCapability,
} from 'twenty-shared/application';

export const buildApplicationCapabilityGrantQuery = (
  capabilities: ApplicationCapability[],
): string => {
  const capabilityLiterals = APPLICATION_CAPABILITIES.filter((capability) =>
    capabilities.includes(capability),
  ).map((capability) => `'${capability}'`);

  return `ARRAY(SELECT DISTINCT capability FROM unnest("grantedCapabilities" || ARRAY[${capabilityLiterals.join(', ')}]::varchar[]) AS capability)`;
};
