import { isObject } from '@sniptt/guards';

export const isMcpToolSafeToTestWithoutConfirmation = ({
  annotations,
}: {
  annotations?: unknown;
}): boolean =>
  isObject(annotations) &&
  'readOnlyHint' in annotations &&
  annotations.readOnlyHint === true;
