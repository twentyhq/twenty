import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { computeVisibleRecordGroupsFilter } from '@/object-record/record-group/utils/computeVisibleRecordGroupsFilter';

const mockFieldMetadata = {
  id: 'field-1',
  name: 'status',
} as FieldMetadataItem;

const buildRecordGroupDefinition = ({
  value,
  isVisible,
}: Pick<
  RecordGroupDefinition,
  'value' | 'isVisible'
>): RecordGroupDefinition => ({
  id: `group-${value ?? 'none'}`,
  type: RecordGroupDefinitionType.Value,
  title: value ?? 'No value',
  value,
  color: 'blue',
  position: 0,
  isVisible,
});

describe('computeVisibleRecordGroupsFilter', () => {
  it('should keep only the visible groups values', () => {
    expect(
      computeVisibleRecordGroupsFilter({
        recordGroupFieldMetadata: mockFieldMetadata,
        recordGroupDefinitions: [
          buildRecordGroupDefinition({ value: 'TODO', isVisible: true }),
          buildRecordGroupDefinition({ value: 'DONE', isVisible: false }),
        ],
      }),
    ).toEqual({ status: { in: ['TODO'] } });
  });

  it('should match no record when every group is hidden', () => {
    expect(
      computeVisibleRecordGroupsFilter({
        recordGroupFieldMetadata: mockFieldMetadata,
        recordGroupDefinitions: [
          buildRecordGroupDefinition({ value: 'TODO', isVisible: false }),
        ],
      }),
    ).toEqual({ id: { is: 'NULL' } });
  });
});
