import { type ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const fromFlatApplicationToApplicationDto = ({
  canBeUninstalled,
  description,
  id,
  name,
  packageJsonChecksum,
  packageJsonFileId,
  yarnLockChecksum,
  yarnLockFileId,
  availablePackages,
  universalIdentifier,
  version,
}: FlatApplication): ApplicationDTO => {
  return {
    canBeUninstalled,
    description: description ?? undefined,
    id,
    name,
    objects: [],
    packageJsonChecksum: packageJsonChecksum ?? undefined,
    packageJsonFileId: packageJsonFileId ?? undefined,
    yarnLockChecksum: yarnLockChecksum ?? undefined,
    yarnLockFileId: yarnLockFileId ?? undefined,
    availablePackages: availablePackages ?? {},
    universalIdentifier,
    version: version ?? undefined,
  };
};
