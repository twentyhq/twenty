import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { mockedUserData } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const instanceId = 'record-index-id';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const opportunityCompanyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'company',
});
const opportunityAmountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'amount',
});
const companyEmployeesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'employees',
});

const buildRecordField = (
  id: string,
  recordField: Partial<RecordField> &
    Pick<RecordField, 'fieldMetadataItemId' | 'position'>,
): RecordField => ({
  id,
  isVisible: true,
  size: 100,
  ...recordField,
});

const companyRecordField = buildRecordField('company', {
  fieldMetadataItemId: opportunityCompanyField.id,
  position: 1,
});
const amountRecordField = buildRecordField('amount', {
  fieldMetadataItemId: opportunityAmountField.id,
  position: 0,
});
const companyEmployeesRecordField = buildRecordField('company-employees', {
  fieldMetadataItemId: opportunityCompanyField.id,
  relationTargetFieldMetadataItemId: companyEmployeesField.id,
  position: 2,
});

const setObjectMetadataItems = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
) => setTestObjectMetadataItemsInMetadataStore(jotaiStore, objectMetadataItems);

const restrictFieldRead = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  fieldMetadataItemId: string,
) =>
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    objectsPermissions: [
      {
        objectMetadataId: objectMetadataItem.id,
        restrictedFields: { [fieldMetadataItemId]: { canRead: false } },
      },
    ],
  });

const setCurrentRecordFields = (recordFields: RecordField[]) =>
  jotaiStore.set(
    currentRecordFieldsComponentState.atomFamily({ instanceId }),
    recordFields,
  );

const getVisibleRecordFieldIds = () =>
  jotaiStore
    .get(visibleRecordFieldsComponentSelector.selectorFamily({ instanceId }))
    .map((recordField) => recordField.id);

describe('visibleRecordFieldsComponentSelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    setObjectMetadataItems([
      opportunityObjectMetadataItem,
      companyObjectMetadataItem,
    ]);
  });

  it('should keep visible, active and readable record fields sorted by position', () => {
    setCurrentRecordFields([
      companyRecordField,
      { ...amountRecordField, isVisible: false },
      companyEmployeesRecordField,
    ]);

    expect(getVisibleRecordFieldIds()).toEqual([
      'company',
      'company-employees',
    ]);
  });

  it('should let a plain column and a column through the same relation coexist', () => {
    setCurrentRecordFields([
      amountRecordField,
      companyRecordField,
      companyEmployeesRecordField,
    ]);

    expect(getVisibleRecordFieldIds()).toEqual([
      'amount',
      'company',
      'company-employees',
    ]);
  });

  it('should drop a record field whose relation target field does not exist', () => {
    setCurrentRecordFields([
      companyRecordField,
      {
        ...companyEmployeesRecordField,
        relationTargetFieldMetadataItemId: 'unknown-field-id',
      },
    ]);

    expect(getVisibleRecordFieldIds()).toEqual(['company']);
  });

  it('should drop a record field whose relation target field is inactive', () => {
    setObjectMetadataItems([
      opportunityObjectMetadataItem,
      {
        ...companyObjectMetadataItem,
        fields: companyObjectMetadataItem.fields.map((fieldMetadataItem) =>
          fieldMetadataItem.id === companyEmployeesField.id
            ? { ...fieldMetadataItem, isActive: false }
            : fieldMetadataItem,
        ),
      },
    ]);
    setCurrentRecordFields([companyRecordField, companyEmployeesRecordField]);

    expect(getVisibleRecordFieldIds()).toEqual(['company']);
  });

  it('should drop a record field whose relation target field is not readable', () => {
    restrictFieldRead(companyObjectMetadataItem, companyEmployeesField.id);
    setCurrentRecordFields([companyRecordField, companyEmployeesRecordField]);

    expect(getVisibleRecordFieldIds()).toEqual(['company']);
  });

  it('should drop every record field on a relation field that is not readable', () => {
    restrictFieldRead(
      opportunityObjectMetadataItem,
      opportunityCompanyField.id,
    );
    setCurrentRecordFields([
      amountRecordField,
      companyRecordField,
      companyEmployeesRecordField,
    ]);

    expect(getVisibleRecordFieldIds()).toEqual(['amount']);
  });
});
