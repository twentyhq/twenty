import { type ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const fromFlatApplicationToApplicationDto = ({
  canBeUninstalled,

  description,
  id,
  name,

  universalIdentifier,
  version,
}: FlatApplication): ApplicationDTO => {
  return {
    canBeUninstalled,
    description: description ?? undefined,
    id,
    name,
    objects: [],
    universalIdentifier,
    version: version ?? undefined,
  };
};
