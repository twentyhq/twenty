import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

export const OAUTH_INSTALL_SOURCE_PATH = 'oauth-install';

export const isDesktopRecorderInstalled = (
  application: Pick<
    ApplicationEntity,
    'state' | 'sourcePath' | 'version'
  > | null,
): boolean =>
  application !== null &&
  // The installer writes the version only after the first install finishes.
  Boolean(application.version) &&
  application.sourcePath !== OAUTH_INSTALL_SOURCE_PATH &&
  // Older instances do not have the lifecycle state column yet.
  (application.state ?? ApplicationState.INSTALLED) ===
    ApplicationState.INSTALLED;
