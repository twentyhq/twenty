import { type RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatRowLevelPermissionPredicate = UniversalFlatEntityFrom<
  RowLevelPermissionPredicateEntity,
  'rowLevelPermissionPredicate'
>;
