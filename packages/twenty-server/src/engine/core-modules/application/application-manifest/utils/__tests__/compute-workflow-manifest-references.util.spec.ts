import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeWorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-manifest-references.util';

const OWNER = 'owner';
const object = {
  universalIdentifier: 'object',
  nameSingular: 'company',
  applicationId: OWNER,
} as FlatObjectMetadata;
const field = {
  universalIdentifier: 'field',
  name: 'name',
  objectMetadataUniversalIdentifier: 'object',
  applicationId: OWNER,
} as FlatFieldMetadata;
const agent = { universalIdentifier: 'agent' } as FlatAgent;
const codeFunction = {
  universalIdentifier: 'code',
  workflowActionTriggerSettings: null,
} as FlatLogicFunction;
const actionFunction = {
  universalIdentifier: 'action',
  workflowActionTriggerSettings: {},
} as FlatLogicFunction;

const proposedMaps = () => {
  const maps = createEmptyAllFlatEntityMaps();
  maps.flatObjectMetadataMaps.byUniversalIdentifier.object = { ...object };
  maps.flatFieldMetadataMaps.byUniversalIdentifier.field = { ...field };
  maps.flatAgentMaps.byUniversalIdentifier.agent = { ...agent };
  maps.flatLogicFunctionMaps.byUniversalIdentifier.code = { ...codeFunction };
  maps.flatLogicFunctionMaps.byUniversalIdentifier.action = {
    ...actionFunction,
  };
  return maps;
};

describe('workflow manifest references', () => {
  it('uses the IDs assigned to metadata in the same installation', () => {
    const proposed = proposedMaps();
    const references = computeWorkflowManifestReferences({
      fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      existingAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      toAllUniversalFlatEntityMaps: proposed,
      ownerApplicationId: OWNER,
    });
    expect(
      references.objectByUniversalIdentifier?.get('object')?.nameSingular,
    ).toBe('company');
    expect(references.fieldByUniversalIdentifier?.get('field')?.id).toBe(
      proposed.flatFieldMetadataMaps.byUniversalIdentifier.field?.id,
    );
    expect(references.agentIdByUniversalIdentifier?.get('agent')).toBe(
      proposed.flatAgentMaps.byUniversalIdentifier.agent?.id,
    );
    expect(references.codeFunctionIdByUniversalIdentifier?.get('code')).toBe(
      proposed.flatLogicFunctionMaps.byUniversalIdentifier.code?.id,
    );
    expect(references.logicFunctionIdByUniversalIdentifier.has('code')).toBe(
      false,
    );
    expect(references.logicFunctionIdByUniversalIdentifier.get('action')).toBe(
      proposed.flatLogicFunctionMaps.byUniversalIdentifier.action?.id,
    );
  });

  it('reuses installed IDs when the application is updated', () => {
    const installed = proposedMaps();
    computeWorkflowManifestReferences({
      fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      existingAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      toAllUniversalFlatEntityMaps: installed,
      ownerApplicationId: OWNER,
    });
    const updated = proposedMaps();
    computeWorkflowManifestReferences({
      fromAllFlatEntityMaps: installed,
      existingAllFlatEntityMaps: installed,
      toAllUniversalFlatEntityMaps: updated,
      ownerApplicationId: OWNER,
    });
    expect(updated.flatAgentMaps.byUniversalIdentifier.agent?.id).toBe(
      installed.flatAgentMaps.byUniversalIdentifier.agent?.id,
    );
    expect(updated.flatFieldMetadataMaps.byUniversalIdentifier.field?.id).toBe(
      installed.flatFieldMetadataMaps.byUniversalIdentifier.field?.id,
    );
    expect(updated.flatLogicFunctionMaps.byUniversalIdentifier.code?.id).toBe(
      installed.flatLogicFunctionMaps.byUniversalIdentifier.code?.id,
    );
  });

  it('allows installed dependency metadata but excludes removed application metadata', () => {
    const installed = proposedMaps();
    installed.flatObjectMetadataMaps.byUniversalIdentifier.standard = {
      ...object,
      universalIdentifier: 'standard',
      applicationId: 'standard-application',
    };
    const references = computeWorkflowManifestReferences({
      fromAllFlatEntityMaps: installed,
      existingAllFlatEntityMaps: installed,
      toAllUniversalFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      ownerApplicationId: OWNER,
    });
    expect(references.objectByUniversalIdentifier?.has('standard')).toBe(true);
    expect(references.objectByUniversalIdentifier?.has('object')).toBe(false);
    expect(references.fieldByUniversalIdentifier?.has('field')).toBe(false);
    expect(references.agentIdByUniversalIdentifier?.size).toBe(0);
  });
});
