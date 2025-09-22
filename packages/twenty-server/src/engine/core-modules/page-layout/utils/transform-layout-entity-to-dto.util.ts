import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import type { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { transformTabEntityToDTO } from 'src/engine/core-modules/page-layout/utils/transform-tab-entity-to-dto.util';

export const transformLayoutEntityToDTO = (
  layout: PageLayoutEntity,
  objectPermissions: ObjectsPermissions,
): PageLayoutDTO => {
  const tabsWithPermissions = layout.tabs?.map((tab) =>
    transformTabEntityToDTO(tab, objectPermissions),
  );

  return {
    id: layout.id,
    name: layout.name,
    type: layout.type,
    objectMetadataId: layout.objectMetadataId,
    createdAt: layout.createdAt,
    updatedAt: layout.updatedAt,
    deletedAt: layout.deletedAt,
    tabs: tabsWithPermissions,
  };
};
