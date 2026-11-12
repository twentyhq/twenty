import { isDefined } from 'twenty-shared/utils';

import { computeDatabaseEventWatchedFieldName } from 'src/engine/core-modules/application/application-manifest/utils/compute-database-event-watched-field-name.util';
import { type WorkflowManifestFieldReference } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';

export const computeWorkflowWatchedFieldName = ({
  name,
  type,
  universalSettings,
  relationTargetObjectMetadataUniversalIdentifier,
}: Pick<
  WorkflowManifestFieldReference,
  | 'name'
  | 'type'
  | 'universalSettings'
  | 'relationTargetObjectMetadataUniversalIdentifier'
>): string | undefined =>
  computeDatabaseEventWatchedFieldName({
    name,
    type,
    relationTargetObjectUniversalIdentifier:
      relationTargetObjectMetadataUniversalIdentifier,
    relationType:
      isDefined(universalSettings) && 'relationType' in universalSettings
        ? universalSettings.relationType
        : undefined,
  });
