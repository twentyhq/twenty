import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

export const isDesktopRecorderInstalled = (
  application: Pick<ApplicationEntity, 'state' | 'sourcePath'> | null,
): boolean =>
  application !== null &&
  application.sourcePath !== 'oauth-install' &&
  // Older instances do not have the lifecycle state column yet.
  (application.state ?? ApplicationState.INSTALLED) ===
    ApplicationState.INSTALLED;
