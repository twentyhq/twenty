import { getFieldUniversalIdentifier } from 'twenty-shared/application';

import { preallocateWorkflowReferenceIds } from 'src/engine/core-modules/application/application-manifest/utils/preallocate-workflow-reference-ids.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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
      objectMetadata: {},
      fieldMetadata: { name: 'installed-name', score: expect.any(String) },
    });
    expect(ids.fieldMetadata?.score).not.toBe(ids.fieldMetadata?.name);
    expect(proposed.flatFieldMetadataMaps.byUniversalIdentifier.score?.id).toBe(
      undefined,
    );
  });

  it('allocates the object and system field IDs of a new object up front', () => {
    const applicationUniversalIdentifier =
      '11111111-1111-4111-8111-111111111111';
    const installed = createEmptyAllFlatEntityMaps();
    installed.flatObjectMetadataMaps.byUniversalIdentifier.ticket = {
      universalIdentifier: 'ticket',
      applicationUniversalIdentifier,
      id: 'installed-ticket',
    } as FlatObjectMetadata;

    const proposed = createEmptyAllFlatEntityMaps();
    proposed.flatObjectMetadataMaps.byUniversalIdentifier.ticket = {
      universalIdentifier: 'ticket',
      applicationUniversalIdentifier,
    } as FlatObjectMetadata;
    proposed.flatObjectMetadataMaps.byUniversalIdentifier.invoice = {
      universalIdentifier: 'invoice',
      applicationUniversalIdentifier,
    } as FlatObjectMetadata;

    const ids = preallocateWorkflowReferenceIds({
      fromAllFlatEntityMaps: installed,
      toAllUniversalFlatEntityMaps: proposed,
    });
    const systemFieldUniversalIdentifier = (
      objectUniversalIdentifier: string,
      name: string,
    ) =>
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier,
        name,
      });

    expect(ids.objectMetadata).toEqual({
      ticket: 'installed-ticket',
      invoice: expect.any(String),
    });
    expect(Object.keys(ids.fieldMetadata ?? {}).sort()).toEqual(
      [
        'id',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'createdBy',
        'updatedBy',
        'position',
      ]
        .map((name) => systemFieldUniversalIdentifier('invoice', name))
        .sort(),
    );
  });
});
