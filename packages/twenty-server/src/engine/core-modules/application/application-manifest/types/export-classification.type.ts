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
>;

export type ParentMetadataName = Extract<
  AllMetadataName,
  'view' | 'pageLayout' | 'pageLayoutTab'
>;
