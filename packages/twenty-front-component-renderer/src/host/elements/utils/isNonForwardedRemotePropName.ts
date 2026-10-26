import { NON_FORWARDED_REMOTE_PROP_NAMES } from '@/constants/NonForwardedRemotePropNames';

export const isNonForwardedRemotePropName = (propName: string): boolean =>
  NON_FORWARDED_REMOTE_PROP_NAMES.has(propName);
