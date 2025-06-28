import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const isWorkflowRelatedObject = (
  objectMetadata: ObjectMetadataEntity,
): boolean => {
  if (objectMetadata.standardId) {
    return (
      objectMetadata.standardId === STANDARD_OBJECT_IDS.workflow ||
      objectMetadata.standardId === STANDARD_OBJECT_IDS.workflowVersion ||
      objectMetadata.standardId === STANDARD_OBJECT_IDS.workflowRun
    );
  }

  return (
    objectMetadata.nameSingular === 'workflow' ||
    objectMetadata.nameSingular === 'workflowVersion' ||
    objectMetadata.nameSingular === 'workflowRun'
  );
};
