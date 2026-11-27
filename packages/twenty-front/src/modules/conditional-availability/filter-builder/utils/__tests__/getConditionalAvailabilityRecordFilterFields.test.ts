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

const getFieldUniversalIdentifierOrThrow = ({
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

  return fieldMetadataItem.universalIdentifier ?? fieldMetadataItem.id;
};

describe('getConditionalAvailabilityRecordFilterFields', () => {
  it('should offer a select field with its options', () => {
    const stageFieldUniversalIdentifier = getFieldUniversalIdentifierOrThrow({
      objectMetadataItem: opportunityObjectMetadataItem,
      name: 'stage',
    });

    const stageFilterField = getConditionalAvailabilityRecordFilterFields({
      objectMetadataId: opportunityObjectMetadataItem.id,
      objectMetadataItems,
      workspaceMembers: [],
      getIcon: () => IconUser,
    }).find(({ key }) => key === stageFieldUniversalIdentifier);

    assertIsDefinedOrThrow(stageFilterField);

    expect(stageFilterField).toMatchObject({
      field: {
        type: 'FIELD',
        fieldUniversalIdentifier: stageFieldUniversalIdentifier,
      },
      objectLabelSingular: opportunityObjectMetadataItem.labelSingular,
      label: 'Stage',
    });
    expect(stageFilterField.options.map(({ value }) => value)).toContain('NEW');
  });

  it('should offer a relation to a workspace member with "Me" first, read through the relation', () => {
    const accountOwnerFieldUniversalIdentifier =
      getFieldUniversalIdentifierOrThrow({
        objectMetadataItem: companyObjectMetadataItem,
        name: 'accountOwner',
      });

    const accountOwnerFilterField =
      getConditionalAvailabilityRecordFilterFields({
        objectMetadataId: companyObjectMetadataItem.id,
        objectMetadataItems,
        workspaceMembers: [
          {
            id: 'workspace-member-1',
            name: { firstName: 'Jane', lastName: 'Doe' },
            avatarUrl: null,
          },
        ],
        getIcon: () => IconUser,
      }).find(({ key }) => key === accountOwnerFieldUniversalIdentifier);

    assertIsDefinedOrThrow(accountOwnerFilterField);

    expect(accountOwnerFilterField).toMatchObject({
      field: {
        type: 'FIELD',
        relationFieldUniversalIdentifier: accountOwnerFieldUniversalIdentifier,
        fieldUniversalIdentifier: getFieldUniversalIdentifierOrThrow({
          objectMetadataItem: workspaceMemberObjectMetadataItem,
          name: 'id',
        }),
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
    const keys = getConditionalAvailabilityRecordFilterFields({
      objectMetadataId: companyObjectMetadataItem.id,
      objectMetadataItems,
      workspaceMembers: [],
      getIcon: () => IconUser,
    }).map(({ key }) => key);

    expect(keys).not.toContain(
      getFieldUniversalIdentifierOrThrow({
        objectMetadataItem: companyObjectMetadataItem,
        name: 'name',
      }),
    );
  });

  it('should offer no field when the page layout has no object', () => {
    expect(
      getConditionalAvailabilityRecordFilterFields({
        objectMetadataId: null,
        objectMetadataItems,
        workspaceMembers: [],
        getIcon: () => IconUser,
      }),
    ).toEqual([]);
  });
});
