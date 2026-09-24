/* @license Enterprise */

import { type InheritedReadabilityChildrenParent } from 'src/engine/core-modules/record-share/types/inherited-readability-children-parent.type';
import { type InheritedReadabilityColumnParent } from 'src/engine/core-modules/record-share/types/inherited-readability-column-parent.type';

export type InheritedReadabilityParent =
  | InheritedReadabilityColumnParent
  | InheritedReadabilityChildrenParent;
