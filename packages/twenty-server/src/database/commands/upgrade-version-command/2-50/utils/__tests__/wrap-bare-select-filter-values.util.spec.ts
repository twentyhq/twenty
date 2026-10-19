import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import {
  wrapBareSelectFilterValue,
  wrapBareSelectRecordFilterValue,
  wrapBareSelectValuesOfFindRecordsSteps,
} from 'src/database/commands/upgrade-version-command/2-50/utils/wrap-bare-select-filter-values.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    'field-stage': { id: 'field-stage', type: FieldMetadataType.SELECT },
    'field-name': { id: 'field-name', type: FieldMetadataType.TEXT },
  },
  universalIdentifierById: {
    'field-stage': 'field-stage',
    'field-name': 'field-name',
  },
} as unknown as FlatEntityMaps<FlatFieldMetadata>;

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
          fieldMetadataId: 'field-stage',
          operand: ViewFilterOperand.IS,
          value: 'WON',
        },
        flatFieldMetadataMaps,
      }),
    ).toMatchObject({ value: '["WON"]' });
  });

  it('leaves a text filter unchanged', () => {
    const recordFilter = {
      fieldMetadataId: 'field-name',
      operand: ViewFilterOperand.CONTAINS,
      value: 'WON',
    };

    expect(
      wrapBareSelectRecordFilterValue({ recordFilter, flatFieldMetadataMaps }),
    ).toBe(recordFilter);
  });

  it('leaves a value-less operand unchanged', () => {
    const recordFilter = {
      fieldMetadataId: 'field-stage',
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
                fieldMetadataId: 'field-stage',
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
