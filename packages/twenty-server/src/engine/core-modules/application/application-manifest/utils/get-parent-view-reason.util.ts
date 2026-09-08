import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import {
  type ParentViewStatus,
  type ViewChildMetadataName,
} from 'src/engine/core-modules/application/application-manifest/types/view-export-classification.type';

export const getParentViewReason = ({
  metadataName,
  parentViewStatus,
}: {
  metadataName: ViewChildMetadataName;
  parentViewStatus: Exclude<ParentViewStatus, 'exported'>;
}): string => {
  const label = MANIFEST_ENTITY_REGISTRY[metadataName].entityKind;

  switch (parentViewStatus) {
    case 'unsupported':
      return `${label} of an unsupported view`;
    case 'engineDerived':
      return `${label} on an engine-derived view`;
    case 'outside':
      return `${label} on a view outside the application`;
  }
};
