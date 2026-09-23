import { type InheritedReadabilityColumnParent } from 'src/engine/core-modules/record-share/types/inherited-readability-column-parent.type';

export type InheritedReadabilityParentLink = Pick<
  InheritedReadabilityColumnParent,
  'joinColumnName' | 'parentFlatObjectMetadata'
>;
