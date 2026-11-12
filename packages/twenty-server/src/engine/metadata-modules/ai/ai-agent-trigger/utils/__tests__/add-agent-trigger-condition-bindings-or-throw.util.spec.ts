import {
  type AgentDatabaseEventTrigger,
  type AgentTrigger,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { addAgentTriggerConditionBindingsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/add-agent-trigger-condition-bindings-or-throw.util';
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

const buildDatabaseEventTrigger = (
  settings: AgentDatabaseEventTrigger['settings'],
): AgentDatabaseEventTrigger => ({
  id: 'trigger-id',
  type: 'DATABASE_EVENT',
  isActive: true,
  instructions: null,
  settings,
});

const addConditionBindings = ({
  triggers,
  storedTriggers,
}: {
  triggers: AgentTrigger[];
  storedTriggers?: AgentTrigger[];
}) =>
  addAgentTriggerConditionBindingsOrThrow({
    triggers,
    storedTriggers,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('addAgentTriggerConditionBindingsOrThrow', () => {
  it('stores the field each condition path reads', () => {
    const condition = "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'";

    expect(
      addConditionBindings({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.updated',
            condition,
          }),
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        settings: {
          eventName: 'opportunity.updated',
          condition,
          conditionBindings: {
            stage: 'opportunity-stage',
            'previous.stage': 'opportunity-stage',
          },
        },
      }),
    ]);
  });

  it('keeps the bindings of a stored condition sent back unchanged', () => {
    const storedTrigger = buildDatabaseEventTrigger({
      eventName: 'opportunity.created',
      condition: 'amount > 0',
      conditionBindings: { amount: 'opportunity-amount' },
    });

    expect(
      addConditionBindings({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'opportunity.created',
            condition: 'amount > 0',
          }),
        ],
        storedTriggers: [storedTrigger],
      }),
    ).toEqual([storedTrigger]);
  });

  it('rejects a condition reading a field the object does not have', () => {
    expect(() =>
      addConditionBindings({
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
      addConditionBindings({
        triggers: [
          buildDatabaseEventTrigger({
            eventName: 'invoice.created',
            condition: "stage == 'PAID'",
          }),
        ],
      }),
    ).toThrow(/Unknown object invoice/);
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

    expect(addConditionBindings({ triggers })).toEqual(triggers);
  });

  it('accepts a stored condition sent back unchanged, even if its field is gone', () => {
    const staleTrigger = buildDatabaseEventTrigger({
      eventName: 'opportunity.created',
      condition: 'amount > 0',
    });

    expect(() =>
      addConditionBindings({
        triggers: [staleTrigger],
        storedTriggers: [staleTrigger],
      }),
    ).not.toThrow();
  });

  it('still checks a stored condition once it is edited', () => {
    expect(() =>
      addConditionBindings({
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
