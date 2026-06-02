import { addMissingFieldOptionIds } from '@/cli/utilities/build/manifest/utils/add-missing-field-option-ids';
import { type FieldManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { validate } from 'uuid';

const buildSelectField = (
  options: FieldManifest<FieldMetadataType.SELECT>['options'],
): FieldManifest<FieldMetadataType.SELECT> => ({
  universalIdentifier: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
  objectUniversalIdentifier: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
  name: 'status',
  label: 'Status',
  type: FieldMetadataType.SELECT,
  options,
});

describe('addMissingFieldOptionIds', () => {
  it('should add a UUID v4 id to every option that is missing one for a SELECT field', () => {
    const fieldManifest = buildSelectField([
      { color: 'green', label: 'Open', value: 'OPEN', position: 1 },
      { color: 'red', label: 'Closed', value: 'CLOSED', position: 2 },
    ]);

    const result = addMissingFieldOptionIds(fieldManifest);

    expect(result.options).toHaveLength(2);
    for (const option of result.options ?? []) {
      expect(validate(option.id)).toBe(true);
    }
  });

  it('should preserve existing ids on options that already have one', () => {
    const existingId = 'cccccccc-cccc-4ccc-cccc-cccccccccccc';
    const fieldManifest = buildSelectField([
      {
        id: existingId,
        color: 'green',
        label: 'Open',
        value: 'OPEN',
        position: 1,
      },
      { color: 'red', label: 'Closed', value: 'CLOSED', position: 2 },
    ]);

    const result = addMissingFieldOptionIds(fieldManifest);

    expect(result.options?.[0].id).toBe(existingId);
    expect(validate(result.options?.[1].id)).toBe(true);
    expect(result.options?.[1].id).not.toBe(existingId);
  });

  it('should also process MULTI_SELECT fields', () => {
    const fieldManifest: FieldManifest<FieldMetadataType.MULTI_SELECT> = {
      universalIdentifier: 'dddddddd-dddd-4ddd-dddd-dddddddddddd',
      objectUniversalIdentifier: 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee',
      name: 'tags',
      label: 'Tags',
      type: FieldMetadataType.MULTI_SELECT,
      options: [
        { color: 'blue', label: 'Urgent', value: 'URGENT', position: 1 },
      ],
    };

    const result = addMissingFieldOptionIds(fieldManifest);

    expect(validate(result.options?.[0].id)).toBe(true);
  });

  it('should return the field manifest unchanged when type is not SELECT or MULTI_SELECT', () => {
    const fieldManifest: FieldManifest<FieldMetadataType.TEXT> = {
      universalIdentifier: 'ffffffff-ffff-4fff-ffff-ffffffffffff',
      objectUniversalIdentifier: '11111111-1111-4111-1111-111111111111',
      name: 'description',
      label: 'Description',
      type: FieldMetadataType.TEXT,
    };

    const result = addMissingFieldOptionIds(fieldManifest);

    expect(result).toBe(fieldManifest);
  });

  it('should return the field manifest unchanged when options is undefined', () => {
    const fieldManifest = buildSelectField(undefined);

    const result = addMissingFieldOptionIds(fieldManifest);

    expect(result).toBe(fieldManifest);
  });

  it('should not mutate the original field manifest or its options', () => {
    const originalOptions = [
      { color: 'green' as const, label: 'Open', value: 'OPEN', position: 1 },
      { color: 'red' as const, label: 'Closed', value: 'CLOSED', position: 2 },
    ];
    const fieldManifest = buildSelectField([...originalOptions]);

    addMissingFieldOptionIds(fieldManifest);

    expect(fieldManifest.options).toEqual(originalOptions);
    for (const option of fieldManifest.options ?? []) {
      expect(option.id).toBeUndefined();
    }
  });

  it('should generate distinct ids for different missing options', () => {
    const fieldManifest = buildSelectField([
      { color: 'green', label: 'A', value: 'A', position: 1 },
      { color: 'red', label: 'B', value: 'B', position: 2 },
      { color: 'blue', label: 'C', value: 'C', position: 3 },
    ]);

    const result = addMissingFieldOptionIds(fieldManifest);

    const ids = result.options?.map((option) => option.id) ?? [];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
