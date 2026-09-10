import {
  type ChildMetadataName,
  type ParentMetadataName,
  type ParentStatus,
} from 'src/engine/core-modules/application/application-manifest/types/export-classification.type';
import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';

export const getParentReason = ({
  metadataName,
  parentMetadataName,
  parentStatus,
}: {
  metadataName: ChildMetadataName;
  parentMetadataName: ParentMetadataName;
  parentStatus: Exclude<ParentStatus, 'exported'>;
}): string => {
  const label = MANIFEST_ENTITY_REGISTRY[metadataName].entityKind;
  const parentLabel = MANIFEST_ENTITY_REGISTRY[parentMetadataName].entityKind;

  switch (parentStatus) {
    case 'unsupported':
      return `${label} of an unsupported ${parentLabel}`;
    case 'engineDerived':
      return `${label} on an engine-derived ${parentLabel}`;
    case 'outside':
      return `${label} on a ${parentLabel} outside the application`;
  }
};
