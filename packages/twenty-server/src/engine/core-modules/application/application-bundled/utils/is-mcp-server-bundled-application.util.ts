import { isNonEmptyArray } from 'twenty-shared/utils';

import { findBundledApplication } from 'src/engine/core-modules/application/application-bundled/utils/find-bundled-application.util';

export const isMcpServerBundledApplication = (
  universalIdentifier: string,
): boolean =>
  isNonEmptyArray(
    findBundledApplication(universalIdentifier)?.manifest.mcpServers,
  );
