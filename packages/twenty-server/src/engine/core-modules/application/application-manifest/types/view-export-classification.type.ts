import { type AllMetadataName } from 'twenty-shared/metadata';

export type ParentViewStatus =
  | 'exported'
  | 'engineDerived'
  | 'unsupported'
  | 'outside';

export type ViewChildMetadataName = Extract<
  AllMetadataName,
  | 'viewField'
  | 'viewFieldGroup'
  | 'viewFilter'
  | 'viewFilterGroup'
  | 'viewGroup'
  | 'viewSort'
>;
