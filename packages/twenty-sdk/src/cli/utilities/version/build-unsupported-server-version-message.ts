import { isDefined } from 'twenty-shared/utils';

import sdkPackageJson from '../../../../package.json';

export const buildUnsupportedServerVersionMessage = (
  serverVersion?: string,
): string => {
  const serverDescription = isDefined(serverVersion)
    ? `this server is ${serverVersion}`
    : 'this server is too old to report its version';

  return (
    `twenty-sdk ${sdkPackageJson.version} requires Twenty server ${sdkPackageJson.engines.twenty}, but ${serverDescription}. ` +
    'Upgrade the server, or install a twenty-sdk version that supports it.'
  );
};
