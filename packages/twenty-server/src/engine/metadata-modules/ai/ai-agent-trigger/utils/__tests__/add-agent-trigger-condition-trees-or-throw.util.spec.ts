import {
  type AgentDatabaseEventTrigger,
  type AgentTrigger,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { addAgentTriggerConditionTreesOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/add-agent-trigger-condition-trees-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const STAGE = getFlatFieldMetadataMock({
  id: 'stage-id',
  universalIdentifier: 'opportunity-stage',
  objectMetadataId: 'opportunity-id',
  type: FieldMetadataType.SELECT,
  name: 'stage',
});

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: STAGE,
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatObjectMetadataMock({
    id: 'opportunity-id',
    universalIdentifier: 'opportunity',
    nameSingular: 'opportunity',
    fieldIds: [STAGE.id],
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const READ_STAGE_TREE = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'FIELD', fieldUniversalIdentifier: 'opportunity-stage' },
  right: { type: 'LITERAL', value: 'CUSTOMER' },
} as const;

const buildDatabaseEventTrigger = (
  settings: AgentDatabaseEventTrigger['settings'],
): AgentDatabaseEventTrigger => ({
  id: 'trigger-id',
  type: 'DATABASE_EVENT',
  isActive: true,
  instructions: null,
  settings,
});

const addConditionTrees = ({
  triggers,
  storedTriggers,
}: {
  triggers: AgentTrigger[];
  storedTriggers?: AgentTrigger[];
}) =>
  addAgentTriggerConditionTreesOrThrow({
    triggers,
    storedTriggers,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('addAgentTriggerConditionTreesOrThrow', () => {
  it('stores a tree reading each field by identifier instead of the text', () => {
    expect(
      addConditionTrees({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.updated',
            condition: "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'",
          }),
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        settings: {
          eventName: 'opportunity.updated',
          conditionTree: {
            type: 'GROUP',
            logicalOperator: 'AND',
            children: [
              READ_STAGE_TREE,
              {
                type: 'COMPARISON',
                operator: 'NOT_EQUAL',
                left: {
                  type: 'FIELD',
                  fieldUniversalIdentifier: 'opportunity-stage',
                  isPreviousValue: true,
                },
                right: { type: 'LITERAL', value: 'CUSTOMER' },
              },
            ],
          },
        },
      }),
    ]);
  });

  it('never takes a tree from the client', () => {
    expect(
      addConditionTrees({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.updated',
            conditionTree: READ_STAGE_TREE,
          }),
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        settings: { eventName: 'opportunity.updated' },
      }),
    ]);
  });

  it('keeps the stored tree of a condition sent back as printed', () => {
    const storedTrigger = buildDatabaseEventTrigger({
      eventName: 'opportunity.created',
      conditionTree: READ_STAGE_TREE,
    });

    expect(
      addConditionTrees({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.created',
            condition: "stage == 'CUSTOMER'",
          }),
        ],
        storedTriggers: [storedTrigger],
      }),
    ).toEqual([storedTrigger]);
  });

  it('rejects a condition reading a field the object does not have', () => {
    expect(() =>
      addConditionTrees({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.created',
            condition: 'amount > 0',
          }),
        ],
      }),
    ).toThrow(/Condition "amount > 0" of an agent trigger is invalid/);
  });

  it('rejects a condition on an unknown object', () => {
    expect(() =>
      addConditionTrees({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'invoice.created',
            condition: "stage == 'PAID'",
          }),
        ],
      }),
    ).toThrow(/a condition needs a trigger on one known object/);
  });

  it('leaves triggers without a condition unchanged', () => {
    const triggers: AgentTrigger[] = [
      buildDatabaseEventTrigger({ eventName: 'invoice.created' }),
      {
        id: 'cron-trigger-id',
        type: 'CRON',
        isActive: true,
        instructions: null,
        settings: { pattern: '0 9 * * 1' },
      },
    ];

    expect(addConditionTrees({ triggers })).toEqual(triggers);
  });

  it('accepts a stored condition sent back unchanged, even if its field is gone', () => {
    const staleTrigger = buildDatabaseEventTrigger({
      eventName: 'opportunity.created',
      conditionTree: {
        type: 'COMPARISON',
        operator: 'GREATER_THAN',
        left: { type: 'FIELD', fieldUniversalIdentifier: 'opportunity-amount' },
        right: { type: 'LITERAL', value: 0 },
      },
    });

    expect(
      addConditionTrees({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.created',
            condition: 'missingField_opportunity_amount > 0',
          }),
        ],
        storedTriggers: [staleTrigger],
      }),
    ).toEqual([staleTrigger]);
  });

  it('keeps the text of a stored condition that has no tree, sent back unchanged', () => {
    const textTrigger = buildDatabaseEventTrigger({
      eventName: 'opportunity.created',
      condition: 'amount > 0',
    });

    expect(
      addConditionTrees({
        triggers: [textTrigger],
        storedTriggers: [textTrigger],
      }),
    ).toEqual([textTrigger]);
  });

  it('still checks a stored condition once it is edited', () => {
    expect(() =>
      addConditionTrees({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.created',
            condition: 'amount > 1',
          }),
        ],
        storedTriggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.created',
            condition: 'amount > 0',
          }),
        ],
      }),
    ).toThrow(/Condition "amount > 1" of an agent trigger is invalid/);
  });
});
