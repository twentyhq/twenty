import { inputSchemaToOutputSchema } from 'twenty-shared/logic-function';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { computeAiAgentOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-ai-agent-output-schema.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  type WorkflowManifestReferences,
  type WorkflowManifestObjectReference,
  type WorkflowManifestFieldReference,
} from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const prepareWorkflowManifestReferences = ({
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  existingAllFlatEntityMaps,
  ownerApplicationId,
}: {
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  ownerApplicationId: string;
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
    logicFunction.id =
      fromAllFlatEntityMaps.flatLogicFunctionMaps.byUniversalIdentifier[
        logicFunction.universalIdentifier
      ]?.id ?? v4();
    const declaredOutputSchema =
      logicFunction.workflowActionTriggerSettings?.outputSchema;
    if (isDefined(declaredOutputSchema)) {
      logicFunctionOutputSchemaByUniversalIdentifier.set(
        logicFunction.universalIdentifier,
        inputSchemaToOutputSchema(declaredOutputSchema),
      );
    }
    if (isDefined(logicFunction.workflowActionTriggerSettings)) {
      logicFunctionIdByUniversalIdentifier.set(
        logicFunction.universalIdentifier,
        logicFunction.id,
      );
    }
  }
  for (const agent of Object.values(
    toAllUniversalFlatEntityMaps.flatAgentMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(agent)) {
      continue;
    }
    agent.id =
      fromAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier[
        agent.universalIdentifier
      ]?.id ?? v4();
    agentIdByUniversalIdentifier.set(agent.universalIdentifier, agent.id);
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
    field.id =
      fromAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        field.universalIdentifier
      ]?.id ?? v4();
    fieldByUniversalIdentifier.set(field.universalIdentifier, {
      ...field,
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
