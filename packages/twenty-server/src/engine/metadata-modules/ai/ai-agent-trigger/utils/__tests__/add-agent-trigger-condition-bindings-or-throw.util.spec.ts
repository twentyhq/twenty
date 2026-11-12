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

const addConditionBindings = (eventName: string, condition: string) =>
  addAgentTriggerConditionBindingsOrThrow({
    triggers: [
      {
        id: 'trigger-id',
        type: 'DATABASE_EVENT',
        isActive: true,
        instructions: null,
        settings: { eventName, condition },
      },
    ],
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('addAgentTriggerConditionBindingsOrThrow', () => {
  it('stores the field each condition path reads', () => {
    expect(
      addConditionBindings(
        'opportunity.updated',
        "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'",
      ),
    ).toEqual([
      expect.objectContaining({
        settings: {
          eventName: 'opportunity.updated',
          condition: "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'",
          conditionBindings: {
            stage: 'opportunity-stage',
            'previous.stage': 'opportunity-stage',
          },
        },
      }),
    ]);
  });

  it('keeps the bindings of a stored condition sent back unchanged', () => {
    const storedTrigger = {
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'opportunity.created',
        condition: 'amount > 0',
        conditionBindings: { amount: 'opportunity-amount' },
      },
    };

    expect(
      addAgentTriggerConditionBindingsOrThrow({
        triggers: [
          {
            type: 'DATABASE_EVENT',
            settings: {
              eventName: 'opportunity.created',
              condition: 'amount > 0',
            },
          },
        ],
        storedTriggers: [storedTrigger],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([storedTrigger]);
  });

  it('accepts a condition on the fields of the trigger object', () => {
    expect(() =>
      addConditionBindings(
        'opportunity.updated',
        "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'",
      ),
    ).not.toThrow();
  });

  it('rejects a condition reading a field the object does not have', () => {
    expect(() =>
      addConditionBindings('opportunity.created', 'amount > 0'),
    ).toThrow(/Condition "amount > 0" of an agent trigger is invalid/);
  });

  it('rejects a condition on an unknown object', () => {
    expect(() =>
      addConditionBindings('invoice.created', "stage == 'PAID'"),
    ).toThrow(/Unknown object invoice/);
  });

  it('ignores triggers without a condition', () => {
    expect(() =>
      addAgentTriggerConditionBindingsOrThrow({
        triggers: [
          {
            type: 'DATABASE_EVENT',
            settings: { eventName: 'invoice.created' },
          },
          { type: 'CRON', settings: { pattern: '0 9 * * 1' } },
        ],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });

  it('accepts a stored condition sent back unchanged, even if its field is gone', () => {
    const staleTrigger = {
      type: 'DATABASE_EVENT',
      settings: { eventName: 'opportunity.created', condition: 'amount > 0' },
    };

    expect(() =>
      addAgentTriggerConditionBindingsOrThrow({
        triggers: [staleTrigger],
        storedTriggers: [staleTrigger],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });

  it('still checks a stored condition once it is edited', () => {
    expect(() =>
      addAgentTriggerConditionBindingsOrThrow({
        triggers: [
          {
            type: 'DATABASE_EVENT',
            settings: {
              eventName: 'opportunity.created',
              condition: 'amount > 1',
            },
          },
        ],
        storedTriggers: [
          {
            type: 'DATABASE_EVENT',
            settings: {
              eventName: 'opportunity.created',
              condition: 'amount > 0',
            },
          },
        ],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toThrow(/Condition "amount > 1" of an agent trigger is invalid/);
  });
});
