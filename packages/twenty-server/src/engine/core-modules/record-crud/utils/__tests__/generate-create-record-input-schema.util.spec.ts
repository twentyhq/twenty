import { FieldMetadataType } from 'twenty-shared/types';

import { generateCreateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-record-input-schema.util';
import type { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

describe('generateCreateRecordInputSchema', () => {
  it('resolves overridden description when present on a field via overrides', () => {
    const rawField = {
      id: 'field-1',
      name: 'dueAt',
      type: FieldMetadataType.TEXT,
      isNullable: true,
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

    const schema = generateCreateRecordInputSchema(objectMetadata);

    const dueAtProperty = schema.shape.dueAt;

    expect(dueAtProperty.description).toBe(
      'Stored in UTC; users dictate local time — convert before writing',
    );
  });

  it('falls back to default description when overrides description is not set', () => {
    const rawField = {
      id: 'field-2',
      name: 'status',
      type: FieldMetadataType.TEXT,
      isNullable: true,
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

    const schema = generateCreateRecordInputSchema(objectMetadata);

    const statusProperty = schema.shape.status;

    expect(statusProperty.description).toBe('Original status description');
  });
});
