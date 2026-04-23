import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatViewFilterGroup = UniversalFlatEntityFrom<
  ViewFilterGroupEntity,
  'viewFilterGroup'
>;
