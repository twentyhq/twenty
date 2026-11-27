import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildDatabaseEventTriggerConditionTreeConversions } from 'src/database/commands/upgrade-version-command/2-65/utils/build-database-event-trigger-condition-tree-conversions.util';
import { fromAgentManifestToUniversalFlatAgent } from 'src/engine/core-modules/application/utils/from-agent-manifest-to-universal-flat-agent.util';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const NOW = '2026-11-26T00:00:00.000Z';

const buildMaps = () => {
  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
    createEmptyFlatEntityMaps();
  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
    createEmptyFlatEntityMaps();

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatObjectMetadataMock({
      id: 'company-id',
      universalIdentifier: 'company',
      nameSingular: 'company',
      fieldIds: ['employees-id', 'stage-id'],
    }),
    flatEntityMapsToMutate: flatObjectMetadataMaps,
  });

  for (const field of [
    { id: 'employees-id', name: 'headcount', type: FieldMetadataType.NUMBER },
    { id: 'stage-id', name: 'stage', type: FieldMetadataType.SELECT },
  ]) {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: getFlatFieldMetadataMock({
        ...field,
        universalIdentifier: field.id.replace('-id', ''),
        objectMetadataId: 'company-id',
      }),
      flatEntityMapsToMutate: flatFieldMetadataMaps,
    });
  }

  return { flatObjectMetadataMaps, flatFieldMetadataMaps };
};

const buildLegacySettings = ({
  condition,
  conditionBindings = {},
}: {
  condition: string;
  conditionBindings?: Record<string, string>;
}): DatabaseEventTriggerSettings & {
  conditionBindings: Record<string, string>;
} => ({
  eventName: 'company.updated',
  batchMode: true,
  condition,
  conditionBindings,
});

const buildFlatAgent = (settings: DatabaseEventTriggerSettings): FlatAgent => ({
  ...fromAgentManifestToUniversalFlatAgent({
    agentManifest: {
      universalIdentifier: 'agent',
      name: 'agent',
      label: 'Agent',
      prompt: 'Help the user.',
      triggers: [
        {
          universalIdentifier: 'trigger',
          type: 'DATABASE_EVENT',
          settings,
        },
        {
          universalIdentifier: 'cron-trigger',
          type: 'CRON',
          settings: { pattern: '0 9 * * 1' },
        },
      ],
    },
    applicationUniversalIdentifier: 'application',
    now: NOW,
  }),
  id: 'agent-id',
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  navigationMenuItemIds: [],
});

const buildFlatLogicFunction = (
  databaseEventTriggerSettings: DatabaseEventTriggerSettings,
): FlatLogicFunction =>
  ({
    id: 'logic-function-id',
    applicationUniversalIdentifier: 'application',
    databaseEventTriggerSettings,
  }) as FlatLogicFunction;

const convert = ({
  flatAgents = [],
  flatLogicFunctions = [],
}: {
  flatAgents?: FlatAgent[];
  flatLogicFunctions?: FlatLogicFunction[];
}) =>
  buildDatabaseEventTriggerConditionTreeConversions({
    flatAgents,
    flatLogicFunctions,
    ...buildMaps(),
  });

const RENAMED_CONDITION_TREE = {
  type: 'GROUP',
  logicalOperator: 'AND',
  children: [
    {
      type: 'COMPARISON',
      operator: 'GREATER_THAN',
      left: { type: 'FIELD', fieldUniversalIdentifier: 'employees' },
      right: { type: 'LITERAL', value: 10 },
    },
    {
      type: 'COMPARISON',
      operator: 'NOT_EQUAL',
      left: {
        type: 'FIELD',
        fieldUniversalIdentifier: 'stage',
        isPreviousValue: true,
      },
      right: { type: 'LITERAL', value: 'WON' },
    },
  ],
};

describe('buildDatabaseEventTriggerConditionTreeConversions', () => {
  it('should store agent and logic function conditions as trees reading the bound fields by identifier', () => {
    const settings = buildLegacySettings({
      condition: 'employees > 10 and previous.stage != "WON"',
      conditionBindings: { employees: 'employees', 'previous.stage': 'stage' },
    });

    const {
      flatAgentsToUpdate,
      flatLogicFunctionsToUpdate,
      textConditionOwnerIds,
    } = convert({
      flatAgents: [buildFlatAgent(settings)],
      flatLogicFunctions: [buildFlatLogicFunction(settings)],
    });

    const convertedSettings = {
      eventName: 'company.updated',
      batchMode: true,
      conditionTree: RENAMED_CONDITION_TREE,
    };

    expect(textConditionOwnerIds).toEqual([]);
    expect(flatAgentsToUpdate).toHaveLength(1);
    expect(flatAgentsToUpdate[0].triggers).toEqual([
      expect.objectContaining({ id: 'trigger', settings: convertedSettings }),
      expect.objectContaining({
        id: 'cron-trigger',
        settings: { pattern: '0 9 * * 1' },
      }),
    ]);
    expect(flatLogicFunctionsToUpdate).toEqual([
      expect.objectContaining({
        id: 'logic-function-id',
        databaseEventTriggerSettings: convertedSettings,
      }),
    ]);
  });

  it('should keep the text of a condition that does not compile', () => {
    const settings = buildLegacySettings({ condition: 'unknownField > 0' });

    expect(
      convert({
        flatAgents: [buildFlatAgent(settings)],
        flatLogicFunctions: [buildFlatLogicFunction(settings)],
      }),
    ).toEqual({
      flatAgentsToUpdate: [],
      flatLogicFunctionsToUpdate: [],
      textConditionOwnerIds: ['agent-id', 'logic-function-id'],
    });
  });

  it('should keep the text of a condition on every object, which names no field', () => {
    expect(
      convert({
        flatLogicFunctions: [
          buildFlatLogicFunction({
            eventName: '*.updated',
            condition: 'isDefined(id)',
          }),
        ],
      }),
    ).toEqual({
      flatAgentsToUpdate: [],
      flatLogicFunctionsToUpdate: [],
      textConditionOwnerIds: ['logic-function-id'],
    });
  });

  it('should leave triggers without a condition or already stored as a tree', () => {
    expect(
      convert({
        flatAgents: [
          buildFlatAgent({
            eventName: 'company.updated',
            conditionTree: RENAMED_CONDITION_TREE,
          }),
        ],
        flatLogicFunctions: [
          buildFlatLogicFunction({ eventName: 'company.created' }),
        ],
      }),
    ).toEqual({
      flatAgentsToUpdate: [],
      flatLogicFunctionsToUpdate: [],
      textConditionOwnerIds: [],
    });
  });
});
