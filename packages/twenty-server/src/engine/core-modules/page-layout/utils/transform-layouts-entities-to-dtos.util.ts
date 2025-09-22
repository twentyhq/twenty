import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import type { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { transformLayoutEntityToDTO } from 'src/engine/core-modules/page-layout/utils/transform-layout-entity-to-dto.util';

export const transformLayoutsEntitiesToDTOs = (
  layouts: PageLayoutEntity[],
  objectPermissions: ObjectsPermissions,
): PageLayoutDTO[] => {
  return layouts.map((layout) =>
    transformLayoutEntityToDTO(layout, objectPermissions),
  );
};
