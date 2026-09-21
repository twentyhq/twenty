import {
  type ApplicationCapability,
  isApplicationCapability,
} from 'twenty-shared/application';

export const toApplicationCapabilities = (
  capabilities: string[] | undefined,
): ApplicationCapability[] =>
  (capabilities ?? []).filter(isApplicationCapability);
