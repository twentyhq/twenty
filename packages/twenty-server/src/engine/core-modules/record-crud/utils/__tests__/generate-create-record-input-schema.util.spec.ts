import { FieldMetadataType } from 'twenty-shared/types';

import { generateCreateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-record-input-schema.util';
import type { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';

const buildMockI18nContext = (
  overrides?: Partial<EffectiveEntityI18nContext>,
): EffectiveEntityI18nContext =>
  ({
    locale: undefined,
    i18nInstance: { _: (id: string) => id },
    isStandardApp: true,
    ...overrides,
  }) as unknown as EffectiveEntityI18nContext;

describe('generateCreateRecordInputSchema', () => {
  it('resolves overridden description through resolveEffectiveEntityProperty', () => {
    const rawField = {
      id: 'field-1',
      name: 'dueAt',
      type: FieldMetadataType.TEXT,
      isNullable: false,
      description: 'Original English description',
      overrides: {
        description:
          'Stored in UTC; users dictate local time — convert before writing',
      },
    } as unknown as FlatFieldMetadata;

    const objectMetadata = {
      ...getFlatObjectMetadataMock({
        universalIdentifier: 'task',
        nameSingular: 'task',
        namePlural: 'tasks',
        labelSingular: 'Task',
        labelPlural: 'Tasks',
      }),
      fields: [rawField],
    };

    const schema = generateCreateRecordInputSchema(
      objectMetadata,
      undefined,
      buildMockI18nContext(),
    );

    expect(schema.shape.dueAt.description).toBe(
      'Stored in UTC; users dictate local time — convert before writing',
    );
  });

  it('falls back to base description when no i18nContext is provided', () => {
    const rawField = {
      id: 'field-2',
      name: 'status',
      type: FieldMetadataType.TEXT,
      isNullable: false,
      description: 'Original status description',
      overrides: null,
    } as unknown as FlatFieldMetadata;

    const objectMetadata = {
      ...getFlatObjectMetadataMock({
        universalIdentifier: 'task',
        nameSingular: 'task',
        namePlural: 'tasks',
        labelSingular: 'Task',
        labelPlural: 'Tasks',
      }),
      fields: [rawField],
    };

    const schema = generateCreateRecordInputSchema(
      objectMetadata,
      undefined,
      buildMockI18nContext(),
    );

    expect(schema.shape.status.description).toBe('Original status description');
  });
});
