import { workflowManifestSchema } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromWorkflowStepManifestToActionOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-step-manifest-to-action-or-throw.util';
import { fromWorkflowTriggerManifestToTriggerOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-trigger-manifest-to-trigger-or-throw.util';
import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type GettingStartedWorkflow } from 'src/engine/core-modules/getting-started/types/getting-started-workflow.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const buildGettingStartedWorkflowContent = ({
  gettingStartedWorkflow: { manifest, triggerTitle },
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  gettingStartedWorkflow: GettingStartedWorkflow;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): { name: string; trigger: WorkflowTrigger; steps: WorkflowAction[] } => {
  const { name, version } = workflowManifestSchema.parse(manifest);

  const references: WorkflowManifestReferences = {
    logicFunctionIdByUniversalIdentifier: new Map(),
    objectByUniversalIdentifier: new Map(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((flatObjectMetadata) => [
          flatObjectMetadata.universalIdentifier,
          flatObjectMetadata,
        ]),
    ),
    fieldByUniversalIdentifier: new Map(
      Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((flatFieldMetadata) => [
          flatFieldMetadata.universalIdentifier,
          {
            ...flatFieldMetadata,
            objectUniversalIdentifier:
              flatFieldMetadata.objectMetadataUniversalIdentifier,
          },
        ]),
    ),
  };

  return {
    name,
    trigger: {
      ...fromWorkflowTriggerManifestToTriggerOrThrow({
        trigger: version.trigger,
        references,
      }),
      name: i18nLabel(triggerTitle),
    },
    steps: version.steps.map((step, index) =>
      fromWorkflowStepManifestToActionOrThrow({ step, index, references }),
    ),
  };
};
