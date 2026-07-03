import { isNonEmptyString } from '@sniptt/guards';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const getLambdaDepsLayerName = ({
  flatApplication,
  namespace,
}: {
  flatApplication: FlatApplication;
  namespace?: string;
}): string => {
  const checksum = flatApplication.yarnLockChecksum ?? 'default';

  return isNonEmptyString(namespace)
    ? `deps-${namespace}-${checksum}`
    : `deps-${checksum}`;
};
