import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const computeWorkflowManifestReferences = ({
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
  const logicFunctionIdByUniversalIdentifier = new Map<string, string>();
  const codeFunctionIdByUniversalIdentifier = new Map<string, string>();
  const agentIdByUniversalIdentifier = new Map<string, string>();
  const objectByUniversalIdentifier = new Map<
    string,
    { nameSingular: string }
  >();
  const fieldByUniversalIdentifier = new Map<
    string,
    { id: string; name: string; objectUniversalIdentifier: string }
  >();

  for (const logicFunction of Object.values(
    toAllUniversalFlatEntityMaps.flatLogicFunctionMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(logicFunction)) continue;
    logicFunction.id =
      fromAllFlatEntityMaps.flatLogicFunctionMaps.byUniversalIdentifier[
        logicFunction.universalIdentifier
      ]?.id ?? v4();
    codeFunctionIdByUniversalIdentifier.set(
      logicFunction.universalIdentifier,
      logicFunction.id,
    );
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
    if (!isDefined(agent)) continue;
    agent.id =
      fromAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier[
        agent.universalIdentifier
      ]?.id ?? v4();
    agentIdByUniversalIdentifier.set(agent.universalIdentifier, agent.id);
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
        id: field.id,
        name: field.name,
        objectUniversalIdentifier: field.objectMetadataUniversalIdentifier,
      });
    }
  }
  for (const object of Object.values(
    toAllUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (isDefined(object))
      objectByUniversalIdentifier.set(object.universalIdentifier, object);
  }
  for (const field of Object.values(
    toAllUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(field)) continue;
    field.id =
      fromAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        field.universalIdentifier
      ]?.id ?? v4();
    fieldByUniversalIdentifier.set(field.universalIdentifier, {
      id: field.id,
      name: field.name,
      objectUniversalIdentifier: field.objectMetadataUniversalIdentifier,
    });
  }
  return {
    logicFunctionIdByUniversalIdentifier,
    codeFunctionIdByUniversalIdentifier,
    agentIdByUniversalIdentifier,
    objectByUniversalIdentifier,
    fieldByUniversalIdentifier,
  };
};
