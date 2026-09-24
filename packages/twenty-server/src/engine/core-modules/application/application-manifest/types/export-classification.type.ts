import { type AllMetadataName } from 'twenty-shared/metadata';

export type ParentStatus =
  | 'exported'
  | 'engineDerived'
  | 'unsupported'
  | 'outside';

export type ChildMetadataName = Extract<
  AllMetadataName,
  | 'viewField'
  | 'viewFieldGroup'
  | 'viewFilter'
  | 'viewFilterGroup'
  | 'viewGroup'
  | 'viewSort'
  | 'pageLayoutTab'
  | 'pageLayoutWidget'
  | 'objectPermission'
  | 'fieldPermission'
  | 'rolePermissionFlag'
  | 'rowLevelPermissionPredicate'
  | 'rowLevelPermissionPredicateGroup'
>;

export type ParentMetadataName = Extract<
  AllMetadataName,
  'view' | 'pageLayout' | 'pageLayoutTab' | 'role'
>;
