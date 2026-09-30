import { inputSchemaToOutputSchema } from 'twenty-shared/logic-function';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { computeAiAgentOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-ai-agent-output-schema.util';
import { isDefined } from 'twenty-shared/utils';

import {
  type WorkflowManifestReferences,
  type WorkflowManifestObjectReference,
  type WorkflowManifestFieldReference,
} from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type IdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';

export const prepareWorkflowManifestReferences = ({
  toAllUniversalFlatEntityMaps,
  existingAllFlatEntityMaps,
  ownerApplicationId,
  idByUniversalIdentifierByMetadataName,
}: {
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  ownerApplicationId: string;
  idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
}): WorkflowManifestReferences => {
  const logicFunctionOutputSchemaByUniversalIdentifier = new Map<
    string,
    BaseOutputSchemaV2
  >();
  const agentOutputSchemaByUniversalIdentifier = new Map<
    string,
    BaseOutputSchemaV2
  >();
  const logicFunctionIdByUniversalIdentifier = new Map<string, string>();
  const agentIdByUniversalIdentifier = new Map<string, string>();
  const objectByUniversalIdentifier = new Map<
    string,
    WorkflowManifestObjectReference
  >();
  const fieldByUniversalIdentifier = new Map<
    string,
    WorkflowManifestFieldReference
  >();

  for (const logicFunction of Object.values(
    toAllUniversalFlatEntityMaps.flatLogicFunctionMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(logicFunction)) {
      continue;
    }
    const declaredOutputSchema =
      logicFunction.workflowActionTriggerSettings?.outputSchema;
    if (isDefined(declaredOutputSchema)) {
      logicFunctionOutputSchemaByUniversalIdentifier.set(
        logicFunction.universalIdentifier,
        inputSchemaToOutputSchema(declaredOutputSchema),
      );
    }
    const logicFunctionId =
      idByUniversalIdentifierByMetadataName.logicFunction?.[
        logicFunction.universalIdentifier
      ];
    if (
      isDefined(logicFunction.workflowActionTriggerSettings) &&
      isDefined(logicFunctionId)
    ) {
      logicFunctionIdByUniversalIdentifier.set(
        logicFunction.universalIdentifier,
        logicFunctionId,
      );
    }
  }
  for (const agent of Object.values(
    toAllUniversalFlatEntityMaps.flatAgentMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(agent)) {
      continue;
    }
    const agentId =
      idByUniversalIdentifierByMetadataName.agent?.[agent.universalIdentifier];
    if (isDefined(agentId)) {
      agentIdByUniversalIdentifier.set(agent.universalIdentifier, agentId);
    }
    agentOutputSchemaByUniversalIdentifier.set(
      agent.universalIdentifier,
      computeAiAgentOutputSchema(agent.responseFormat),
    );
  }
  for (const object of Object.values(
    existingAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (isDefined(object) && object.applicationId !== ownerApplicationId) {
      objectByUniversalIdentifier.set(object.universalIdentifier, object);
    }
  }
  for (const field of Object.values(
    existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (isDefined(field) && field.applicationId !== ownerApplicationId) {
      fieldByUniversalIdentifier.set(field.universalIdentifier, {
        ...field,
        objectUniversalIdentifier: field.objectMetadataUniversalIdentifier,
      });
    }
  }
  for (const object of Object.values(
    toAllUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (isDefined(object)) {
      objectByUniversalIdentifier.set(object.universalIdentifier, object);
    }
  }
  for (const field of Object.values(
    toAllUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(field)) {
      continue;
    }
    const fieldId =
      idByUniversalIdentifierByMetadataName.fieldMetadata?.[
        field.universalIdentifier
      ];
    if (!isDefined(fieldId)) {
      continue;
    }
    fieldByUniversalIdentifier.set(field.universalIdentifier, {
      ...field,
      id: fieldId,
      objectUniversalIdentifier: field.objectMetadataUniversalIdentifier,
    });
  }
  return {
    logicFunctionOutputSchemaByUniversalIdentifier,
    agentOutputSchemaByUniversalIdentifier,
    logicFunctionIdByUniversalIdentifier,
    agentIdByUniversalIdentifier,
    objectByUniversalIdentifier,
    fieldByUniversalIdentifier,
  };
};
