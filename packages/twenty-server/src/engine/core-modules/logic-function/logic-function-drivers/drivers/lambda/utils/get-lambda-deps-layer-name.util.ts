import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const getLambdaDepsLayerName = (
  flatApplication: FlatApplication,
): string => {
  const checksum = flatApplication.yarnLockChecksum ?? 'default';

  return `deps-${checksum}`;
};
