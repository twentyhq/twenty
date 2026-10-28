import { inputSchemaToOutputSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

import {
  type WorkflowManifestFieldReference,
  type WorkflowManifestObjectReference,
  type WorkflowManifestReferences,
} from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { computeAiAgentOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-ai-agent-output-schema.util';

// Mirrors prepareWorkflowManifestReferences: own metadata resolves only if exported, foreign always.
export const buildWorkflowManifestExportReferences = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
  resolvableFieldUniversalIdentifiers,
  canReferenceOtherApplicationsWorkflowActions,
}: {
  applicationAllFlatEntityMaps: Pick<
    AllFlatEntityMaps,
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatLogicFunctionMaps'
    | 'flatAgentMaps'
  >;
  allFlatEntityMaps: Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatLogicFunctionMaps'
  >;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
  resolvableFieldUniversalIdentifiers: ReadonlySet<string>;
  canReferenceOtherApplicationsWorkflowActions: boolean;
}): WorkflowManifestReferences => {
  const objectByUniversalIdentifier = new Map<
    string,
    WorkflowManifestObjectReference
  >();
  const fieldByUniversalIdentifier = new Map<
    string,
    WorkflowManifestFieldReference
  >();
  const logicFunctionIdByUniversalIdentifier = new Map<string, string>();
  const logicFunctionOutputSchemaByUniversalIdentifier = new Map<
    string,
    BaseOutputSchemaV2
  >();
  const agentIdByUniversalIdentifier = new Map<string, string>();
  const agentOutputSchemaByUniversalIdentifier = new Map<
    string,
    BaseOutputSchemaV2
  >();

  for (const flatObjectMetadata of Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const { universalIdentifier } = flatObjectMetadata;
    const isApplicationObject = isDefined(
      applicationAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        universalIdentifier
      ],
    );

    if (
      !isApplicationObject ||
      exportedObjectUniversalIdentifiers.has(universalIdentifier)
    ) {
      objectByUniversalIdentifier.set(universalIdentifier, flatObjectMetadata);
    }
  }

  for (const flatFieldMetadata of Object.values(
    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const { universalIdentifier } = flatFieldMetadata;
    const isApplicationField = isDefined(
      applicationAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        universalIdentifier
      ],
    );

    if (
      !isApplicationField ||
      resolvableFieldUniversalIdentifiers.has(universalIdentifier)
    ) {
      fieldByUniversalIdentifier.set(universalIdentifier, {
        ...flatFieldMetadata,
        objectUniversalIdentifier:
          flatFieldMetadata.objectMetadataUniversalIdentifier,
      });
    }
  }

  // Mirrors the sync rule: only the workspace custom application may call other apps' actions
  const referenceableFlatLogicFunctionMaps =
    canReferenceOtherApplicationsWorkflowActions
      ? allFlatEntityMaps.flatLogicFunctionMaps
      : applicationAllFlatEntityMaps.flatLogicFunctionMaps;

  for (const flatLogicFunction of Object.values(
    referenceableFlatLogicFunctionMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (isDefined(flatLogicFunction.deletedAt)) {
      continue;
    }

    const { universalIdentifier, workflowActionTriggerSettings } =
      flatLogicFunction;

    if (!isDefined(workflowActionTriggerSettings)) {
      continue;
    }

    logicFunctionIdByUniversalIdentifier.set(
      universalIdentifier,
      flatLogicFunction.id,
    );

    if (isDefined(workflowActionTriggerSettings.outputSchema)) {
      logicFunctionOutputSchemaByUniversalIdentifier.set(
        universalIdentifier,
        inputSchemaToOutputSchema(workflowActionTriggerSettings.outputSchema),
      );
    }
  }

  for (const flatAgent of Object.values(
    applicationAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    agentIdByUniversalIdentifier.set(
      flatAgent.universalIdentifier,
      flatAgent.id,
    );
    agentOutputSchemaByUniversalIdentifier.set(
      flatAgent.universalIdentifier,
      computeAiAgentOutputSchema(flatAgent.responseFormat),
    );
  }

  return {
    objectByUniversalIdentifier,
    fieldByUniversalIdentifier,
    logicFunctionIdByUniversalIdentifier,
    logicFunctionOutputSchemaByUniversalIdentifier,
    agentIdByUniversalIdentifier,
    agentOutputSchemaByUniversalIdentifier,
  };
};
