import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import {
  wrapBareSelectFilterValue,
  wrapBareSelectRecordFilterValue,
  wrapBareSelectValuesOfFindRecordsSteps,
} from 'src/database/commands/upgrade-version-command/2-50/utils/wrap-bare-select-filter-values.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

const OBJECT_ID = '33333333-3333-4333-8333-333333333333';
const STAGE_FIELD_ID = '44444444-4444-4444-8444-444444444444';
const NAME_FIELD_ID = '55555555-5555-4555-8555-555555555555';

const flatFieldMetadataMaps = [
  { id: STAGE_FIELD_ID, type: FieldMetadataType.SELECT },
  { id: NAME_FIELD_ID, type: FieldMetadataType.TEXT },
].reduce(
  (flatEntityMaps, { id, type }) =>
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: getFlatFieldMetadataMock({
        id,
        universalIdentifier: id,
        objectMetadataId: OBJECT_ID,
        type,
      }),
      flatEntityMaps,
    }),
  createEmptyFlatEntityMaps(),
);

describe('wrapBareSelectFilterValue', () => {
  it.each([
    ['WON', '["WON"]'],
    ['"WON"', '["WON"]'],
    ['123', '["123"]'],
  ])('wraps %s into %s', (value, expected) => {
    expect(wrapBareSelectFilterValue(value)).toBe(expected);
  });

  it.each(['["WON"]', '', '{{trigger.stage}}', '{"unit":"DAY"}', '[1]'])(
    'leaves %s unchanged',
    (value) => {
      expect(wrapBareSelectFilterValue(value)).toBe(value);
    },
  );
});

describe('wrapBareSelectRecordFilterValue', () => {
  it('wraps the value of a select filter', () => {
    expect(
      wrapBareSelectRecordFilterValue({
        recordFilter: {
          fieldMetadataId: STAGE_FIELD_ID,
          operand: ViewFilterOperand.IS,
          value: 'WON',
        },
        flatFieldMetadataMaps,
      }),
    ).toMatchObject({ value: '["WON"]' });
  });

  it('leaves a text filter unchanged', () => {
    const recordFilter = {
      fieldMetadataId: NAME_FIELD_ID,
      operand: ViewFilterOperand.CONTAINS,
      value: 'WON',
    };

    expect(
      wrapBareSelectRecordFilterValue({ recordFilter, flatFieldMetadataMaps }),
    ).toBe(recordFilter);
  });

  it('leaves a value-less operand unchanged', () => {
    const recordFilter = {
      fieldMetadataId: STAGE_FIELD_ID,
      operand: ViewFilterOperand.IS_EMPTY,
      value: 'WON',
    };

    expect(
      wrapBareSelectRecordFilterValue({ recordFilter, flatFieldMetadataMaps }),
    ).toBe(recordFilter);
  });
});

describe('wrapBareSelectValuesOfFindRecordsSteps', () => {
  const buildSteps = (value: string) => [
    {
      id: 'step-1',
      type: 'FIND_RECORDS',
      settings: {
        input: {
          objectName: 'opportunity',
          filter: {
            recordFilters: [
              {
                fieldMetadataId: STAGE_FIELD_ID,
                operand: ViewFilterOperand.IS,
                value,
              },
            ],
          },
        },
      },
    },
  ];

  it('wraps bare values of Find Records filters', () => {
    expect(
      wrapBareSelectValuesOfFindRecordsSteps({
        steps: buildSteps('WON'),
        flatFieldMetadataMaps,
      }),
    ).toEqual({ value: buildSteps('["WON"]'), hasChanged: true });
  });

  it('reports no change for canonical values', () => {
    const steps = buildSteps('["WON"]');

    expect(
      wrapBareSelectValuesOfFindRecordsSteps({ steps, flatFieldMetadataMaps }),
    ).toEqual({ value: steps, hasChanged: false });
  });
});
