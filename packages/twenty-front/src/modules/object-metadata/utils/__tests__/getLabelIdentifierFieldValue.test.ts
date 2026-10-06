import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const titleField = {
  name: 'title',
  type: FieldMetadataType.TEXT,
} as FieldMetadataItem;

const record = (fields: Record<string, unknown>) =>
  ({ __typename: 'CalendarEvent', id: 'id', ...fields }) as ObjectRecord;

describe('getLabelIdentifierFieldValue', () => {
  it('should return the label identifier value', () => {
    expect(
      getLabelIdentifierFieldValue(
        record({ title: 'Weekly sync' }),
        titleField,
      ),
    ).toBe('Weekly sync');
  });

  it('should say a restricted title is not shared rather than print the sentinel', () => {
    expect(
      getLabelIdentifierFieldValue(
        record({ title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED }),
        titleField,
      ),
    ).toBe('Not shared');
  });

  it('should fall back to the record id without a label identifier field', () => {
    expect(getLabelIdentifierFieldValue(record({}), undefined)).toBe('id');
  });
});
