import { type RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { type RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';

export type RowLevelPermissionsByRole = {
  rowLevelPermissionPredicates: RowLevelPermissionPredicateDTO[];
  rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroupDTO[];
};
