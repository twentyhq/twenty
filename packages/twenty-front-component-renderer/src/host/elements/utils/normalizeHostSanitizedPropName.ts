import { HOST_SANITIZED_PROP_NAMES } from '@/constants/HostSanitizedPropNames';

export const normalizeHostSanitizedPropName = (propName: string): string => {
  const lowercasedPropName = propName.toLowerCase();

  return HOST_SANITIZED_PROP_NAMES.has(lowercasedPropName)
    ? lowercasedPropName
    : propName;
};
