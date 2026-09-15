import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectFieldManifest } from 'twenty-shared/application';

import { getFieldDefaultValueWarnings } from '@/sdk/define/fields/get-field-default-value-warnings';

const buildField = (
  overrides: Partial<ObjectFieldManifest>,
): ObjectFieldManifest =>
  ({
    universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
    type: FieldMetadataType.TEXT,
    name: 'title',
    label: 'Title',
    ...overrides,
  }) as ObjectFieldManifest;

describe('getFieldDefaultValueWarnings', () => {
  it('returns no warning when fields are undefined', () => {
    expect(getFieldDefaultValueWarnings(undefined)).toEqual([]);
  });

  it('returns no warning when defaultValue is not set', () => {
    expect(getFieldDefaultValueWarnings([buildField({})])).toEqual([]);
  });

  it('returns no warning for quoted string default values', () => {
    expect(
      getFieldDefaultValueWarnings([buildField({ defaultValue: "'todo'" })]),
    ).toEqual([]);
  });

  it('returns no warning for computed default values', () => {
    expect(
      getFieldDefaultValueWarnings([
        buildField({ type: FieldMetadataType.UUID, defaultValue: 'uuid' }),
        buildField({ type: FieldMetadataType.DATE_TIME, defaultValue: 'now' }),
      ]),
    ).toEqual([]);
  });

  it('warns for unquoted string default values', () => {
    const warnings = getFieldDefaultValueWarnings([
      buildField({ defaultValue: 'todo' }),
    ]);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Field "Title"');
    expect(warnings[0]).toContain('"todo"');
    expect(warnings[0]).toContain('"\'todo\'"');
  });

  it('warns for unquoted items in multi-select default values', () => {
    const warnings = getFieldDefaultValueWarnings([
      buildField({
        type: FieldMetadataType.MULTI_SELECT,
        defaultValue: ['OPTION_1', "'OPTION_2'"],
      }),
    ]);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('"OPTION_1"');
    expect(warnings[0]).not.toContain('OPTION_2');
  });

  it('warns for unquoted string properties of composite default values', () => {
    const warnings = getFieldDefaultValueWarnings([
      buildField({
        type: FieldMetadataType.ACTOR,
        defaultValue: { source: 'MANUAL', name: "'No Source'" },
      }),
    ]);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('"MANUAL"');
  });

  it('returns no warning for non-composite object default values', () => {
    expect(
      getFieldDefaultValueWarnings([
        buildField({
          type: FieldMetadataType.RAW_JSON,
          defaultValue: { foo: 'bar' },
        }),
      ]),
    ).toEqual([]);
  });

  it('returns no warning for non-string default values', () => {
    expect(
      getFieldDefaultValueWarnings([
        buildField({ type: FieldMetadataType.NUMBER, defaultValue: 42 }),
        buildField({ type: FieldMetadataType.BOOLEAN, defaultValue: true }),
        buildField({ defaultValue: null }),
      ]),
    ).toEqual([]);
  });
});
