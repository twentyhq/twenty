import { preallocateWorkflowReferenceIds } from 'src/engine/core-modules/application/application-manifest/utils/preallocate-workflow-reference-ids.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

describe('preallocateWorkflowReferenceIds', () => {
  it('reuses installed IDs, allocates new ones and leaves definitions untouched', () => {
    const installed = createEmptyAllFlatEntityMaps();
    installed.flatLogicFunctionMaps.byUniversalIdentifier.greet = {
      universalIdentifier: 'greet',
      id: 'installed-greet',
    } as FlatLogicFunction;
    installed.flatAgentMaps.byUniversalIdentifier.summarize = {
      universalIdentifier: 'summarize',
      id: 'installed-summarize',
    } as FlatAgent;
    installed.flatFieldMetadataMaps.byUniversalIdentifier.name = {
      universalIdentifier: 'name',
      id: 'installed-name',
    } as FlatFieldMetadata;

    const proposed = createEmptyAllFlatEntityMaps();
    proposed.flatLogicFunctionMaps.byUniversalIdentifier.greet = {
      universalIdentifier: 'greet',
    } as FlatLogicFunction;
    proposed.flatAgentMaps.byUniversalIdentifier.summarize = {
      universalIdentifier: 'summarize',
    } as FlatAgent;
    proposed.flatFieldMetadataMaps.byUniversalIdentifier.name = {
      universalIdentifier: 'name',
    } as FlatFieldMetadata;
    proposed.flatFieldMetadataMaps.byUniversalIdentifier.score = {
      universalIdentifier: 'score',
    } as FlatFieldMetadata;

    const ids = preallocateWorkflowReferenceIds({
      fromAllFlatEntityMaps: installed,
      toAllUniversalFlatEntityMaps: proposed,
    });

    expect(ids).toEqual({
      logicFunction: { greet: 'installed-greet' },
      agent: { summarize: 'installed-summarize' },
      fieldMetadata: { name: 'installed-name', score: expect.any(String) },
    });
    expect(ids.fieldMetadata?.score).not.toBe(ids.fieldMetadata?.name);
    expect(proposed.flatFieldMetadataMaps.byUniversalIdentifier.score?.id).toBe(
      undefined,
    );
  });
});
