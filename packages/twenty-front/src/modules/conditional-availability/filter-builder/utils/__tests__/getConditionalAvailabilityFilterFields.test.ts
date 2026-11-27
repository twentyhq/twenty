import { getConditionalAvailabilityFilterFields } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterFields';

const getOptionsOfField = ({
  key,
  filterFields,
}: {
  key: string;
  filterFields: ReturnType<typeof getConditionalAvailabilityFilterFields>;
}) =>
  filterFields
    .find((filterField) => filterField.key === key)
    ?.options.map(({ value, label }) => ({ value, label }));

describe('getConditionalAvailabilityFilterFields', () => {
  it('should only offer the roles that can be assigned to users and have a universal identifier', () => {
    const filterFields = getConditionalAvailabilityFilterFields({
      roles: [
        {
          label: 'Admin',
          universalIdentifier: 'admin-universal-identifier',
          canBeAssignedToUsers: true,
        },
        {
          label: 'Agent only',
          universalIdentifier: 'agent-only-universal-identifier',
          canBeAssignedToUsers: false,
        },
        {
          label: 'Without identifier',
          universalIdentifier: null,
          canBeAssignedToUsers: true,
        },
      ],
      workspaceMembers: [],
    });

    expect(getOptionsOfField({ key: 'currentRole', filterFields })).toEqual([
      { value: 'admin-universal-identifier', label: 'Admin' },
    ]);
  });

  it('should offer each workspace member under their full name', () => {
    const filterFields = getConditionalAvailabilityFilterFields({
      roles: [],
      workspaceMembers: [
        {
          id: 'workspace-member-1',
          name: { firstName: 'Jane', lastName: 'Doe' },
          avatarUrl: null,
        },
        {
          id: 'workspace-member-2',
          name: { firstName: 'Tim', lastName: '' },
          avatarUrl: null,
        },
      ],
    });

    expect(
      getOptionsOfField({ key: 'currentWorkspaceMember', filterFields }),
    ).toEqual([
      { value: 'workspace-member-1', label: 'Jane Doe' },
      { value: 'workspace-member-2', label: 'Tim' },
    ]);
  });

  it('should offer the two devices', () => {
    const filterFields = getConditionalAvailabilityFilterFields({
      roles: [],
      workspaceMembers: [],
    });

    expect(getOptionsOfField({ key: 'device', filterFields })).toEqual([
      { value: 'DESKTOP', label: 'Desktop' },
      { value: 'MOBILE', label: 'Mobile' },
    ]);
  });
});
