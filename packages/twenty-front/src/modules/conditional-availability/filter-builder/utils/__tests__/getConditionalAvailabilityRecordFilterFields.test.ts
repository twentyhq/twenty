import { getConditionalAvailabilityRecordFilterFields } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityRecordFilterFields';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { IconUser } from 'twenty-ui/icon';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const workspaceMemberObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('workspaceMember');

const objectMetadataItems = [
  companyObjectMetadataItem,
  opportunityObjectMetadataItem,
  workspaceMemberObjectMetadataItem,
];

const getFieldMetadataItemOrThrow = ({
  objectMetadataItem,
  name,
}: {
  objectMetadataItem: Pick<typeof companyObjectMetadataItem, 'fields'>;
  name: string;
}) => {
  const fieldMetadataItem = objectMetadataItem.fields.find(
    (candidate) => candidate.name === name,
  );

  assertIsDefinedOrThrow(fieldMetadataItem);

  return fieldMetadataItem;
};

describe('getConditionalAvailabilityRecordFilterFields', () => {
  it('should offer a select field with its options', () => {
    const stageFieldMetadataItem = getFieldMetadataItemOrThrow({
      objectMetadataItem: opportunityObjectMetadataItem,
      name: 'stage',
    });

    const filterFields = getConditionalAvailabilityRecordFilterFields({
      objectMetadataItem: opportunityObjectMetadataItem,
      objectMetadataItems,
      workspaceMembers: [],
      getIcon: () => IconUser,
    });

    expect(filterFields).toContainEqual({
      field: {
        type: 'FIELD',
        fieldUniversalIdentifier:
          stageFieldMetadataItem.universalIdentifier ??
          stageFieldMetadataItem.id,
      },
      objectLabelSingular: opportunityObjectMetadataItem.labelSingular,
      label: stageFieldMetadataItem.label,
      Icon: IconUser,
      options: (stageFieldMetadataItem.options ?? []).map(
        ({ value, label }) => ({ value, label }),
      ),
    });
  });

  it('should offer a relation to a workspace member with "Me" first, read through the relation', () => {
    const accountOwnerFieldMetadataItem = getFieldMetadataItemOrThrow({
      objectMetadataItem: companyObjectMetadataItem,
      name: 'accountOwner',
    });
    const workspaceMemberIdFieldMetadataItem = getFieldMetadataItemOrThrow({
      objectMetadataItem: workspaceMemberObjectMetadataItem,
      name: 'id',
    });

    const accountOwnerFilterField =
      getConditionalAvailabilityRecordFilterFields({
        objectMetadataItem: companyObjectMetadataItem,
        objectMetadataItems,
        workspaceMembers: [
          {
            id: 'workspace-member-1',
            name: { firstName: 'Jane', lastName: 'Doe' },
            avatarUrl: null,
          },
        ],
        getIcon: () => IconUser,
      }).find(({ label }) => label === accountOwnerFieldMetadataItem.label);

    assertIsDefinedOrThrow(accountOwnerFilterField);

    expect(accountOwnerFilterField).toMatchObject({
      field: {
        type: 'FIELD',
        relationFieldUniversalIdentifier:
          accountOwnerFieldMetadataItem.universalIdentifier ??
          accountOwnerFieldMetadataItem.id,
        fieldUniversalIdentifier:
          workspaceMemberIdFieldMetadataItem.universalIdentifier ??
          workspaceMemberIdFieldMetadataItem.id,
      },
      objectLabelSingular: companyObjectMetadataItem.labelSingular,
    });
    expect(
      accountOwnerFilterField.options.map(({ value, label }) => ({
        value,
        label,
      })),
    ).toEqual([
      { value: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID, label: 'Me' },
      { value: 'workspace-member-1', label: 'Jane Doe' },
    ]);
  });

  it('should not offer a field that is neither a select nor a relation to a workspace member', () => {
    const nameFieldMetadataItem = getFieldMetadataItemOrThrow({
      objectMetadataItem: companyObjectMetadataItem,
      name: 'name',
    });

    const labels = getConditionalAvailabilityRecordFilterFields({
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems,
      workspaceMembers: [],
      getIcon: () => IconUser,
    }).map(({ label }) => label);

    expect(labels).not.toContain(nameFieldMetadataItem.label);
  });
});
