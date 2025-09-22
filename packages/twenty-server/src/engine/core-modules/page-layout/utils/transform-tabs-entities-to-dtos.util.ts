import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutTabDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-tab.dto';
import type { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { transformTabEntityToDTO } from 'src/engine/core-modules/page-layout/utils/transform-tab-entity-to-dto.util';

export const transformTabsEntitiesToDTOs = (
  tabs: PageLayoutTabEntity[],
  objectPermissions: ObjectsPermissions,
): PageLayoutTabDTO[] => {
  return tabs.map((tab) => transformTabEntityToDTO(tab, objectPermissions));
};
