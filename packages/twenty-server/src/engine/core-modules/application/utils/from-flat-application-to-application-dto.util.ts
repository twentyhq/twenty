import { type ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const fromFlatApplicationToApplicationDto = ({
  canBeUninstalled,
  autoUpgrade,
  description,
  id,
  logo,
  name,
  packageJsonChecksum,
  packageJsonFileId,
  yarnLockChecksum,
  yarnLockFileId,
  availablePackages,
  universalIdentifier,
  version,
  settingsCustomTabFrontComponentId,
}: FlatApplication): ApplicationDTO => {
  return {
    canBeUninstalled,
    autoUpgrade,
    description: description ?? undefined,
    id,
    logo: logo ?? undefined,
    name,
    objects: [],
    packageJsonChecksum: packageJsonChecksum ?? undefined,
    packageJsonFileId: packageJsonFileId ?? undefined,
    yarnLockChecksum: yarnLockChecksum ?? undefined,
    yarnLockFileId: yarnLockFileId ?? undefined,
    availablePackages: availablePackages ?? {},
    universalIdentifier,
    version: version ?? undefined,
    settingsCustomTabFrontComponentId:
      settingsCustomTabFrontComponentId ?? undefined,
  };
};
