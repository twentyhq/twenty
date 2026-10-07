import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('opportunity');
const nameField = objectMetadataItem.fields.find(
  (field) => field.name === 'name',
);

if (!isDefined(nameField)) {
  throw new Error(
    'The advanced filter story requires an opportunity name field',
  );
}

const recordFilterGroup: RecordFilterGroup = {
  id: 'advanced-filter-story-root-group',
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
  positionInRecordFilterGroup: 0,
};

const recordFilter: RecordFilter = {
  id: 'advanced-filter-story-name-rule',
  fieldMetadataId: nameField.id,
  label: nameField.label,
  type: 'TEXT',
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
  displayValue: 'Acme',
  recordFilterGroupId: recordFilterGroup.id,
  positionInRecordFilterGroup: 0,
};

export const ADVANCED_FILTER_STORY_DATA = {
  instanceId: 'advanced-filter-view-story',
  objectMetadataItem,
  recordFilterGroup,
  recordFilter,
};
