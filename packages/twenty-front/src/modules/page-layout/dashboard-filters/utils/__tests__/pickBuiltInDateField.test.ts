import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { pickBuiltInDateField } from '@/page-layout/dashboard-filters/utils/pickBuiltInDateField';
import { FieldMetadataType } from 'twenty-shared/types';

const buildField = ({
  id = 'created-at-id',
  name = 'createdAt',
  type = FieldMetadataType.DATE_TIME,
  isActive = true,
}: {
  id?: string;
  name?: string;
  type?: FieldMetadataType;
  isActive?: boolean;
}) => ({ id, name, type, isActive }) as FieldMetadataItem;

const CREATED_AT_FIELD = buildField({});

const NAME_FIELD = buildField({
  id: 'name-id',
  name: 'name',
  type: FieldMetadataType.TEXT,
});

describe('pickBuiltInDateField', () => {
  it('picks the active createdAt date time field', () => {
    expect(pickBuiltInDateField([NAME_FIELD, CREATED_AT_FIELD])).toBe(
      CREATED_AT_FIELD,
    );
  });

  it('picks nothing when createdAt is inactive', () => {
    expect(
      pickBuiltInDateField([buildField({ isActive: false })]),
    ).toBeUndefined();
  });

  it('picks nothing when createdAt is not a date time', () => {
    expect(
      pickBuiltInDateField([buildField({ type: FieldMetadataType.DATE })]),
    ).toBeUndefined();
  });

  it('ignores other date time fields', () => {
    expect(
      pickBuiltInDateField([
        buildField({
          id: 'updated-at-id',
          name: 'updatedAt',
          type: FieldMetadataType.DATE_TIME,
        }),
      ]),
    ).toBeUndefined();
  });
});
