import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { removeConditionalAvailabilityFilterOrGroup } from '@/conditional-availability/utils/removeConditionalAvailabilityFilterOrGroup';

const ROLE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'role-filter',
  variable: 'currentRole',
  operator: 'isAnyOf',
  values: ['20202020-0000-4000-8000-000000000001'],
};

const DEVICE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'device-filter',
  variable: 'device',
  operator: 'is',
  values: ['MOBILE'],
};

const WORKSPACE_MEMBER_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'workspace-member-filter',
  variable: 'currentWorkspaceMember',
  operator: 'is',
  values: ['20202020-1111-4000-8000-000000000001'],
};

const NESTED_FILTER_GROUP: ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup',
  id: 'nested-filter-group',
  logicalOperator: 'OR',
  children: [DEVICE_FILTER, WORKSPACE_MEMBER_FILTER],
};

const FILTER_GROUP: ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup',
  id: 'root',
  logicalOperator: 'AND',
  children: [ROLE_FILTER, NESTED_FILTER_GROUP],
};

describe('removeConditionalAvailabilityFilterOrGroup', () => {
  it('should remove a filter of the root and keep the rest', () => {
    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: ROLE_FILTER.id,
      }).children,
    ).toEqual([NESTED_FILTER_GROUP]);
  });

  it('should remove a filter inside a group and keep the group', () => {
    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: DEVICE_FILTER.id,
      }).children,
    ).toEqual([
      ROLE_FILTER,
      { ...NESTED_FILTER_GROUP, children: [WORKSPACE_MEMBER_FILTER] },
    ]);
  });

  it('should remove a group with all its filters', () => {
    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: NESTED_FILTER_GROUP.id,
      }).children,
    ).toEqual([ROLE_FILTER]);
  });

  it('should drop a group once its last filter is removed', () => {
    const filterGroupWithoutDeviceFilter =
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: DEVICE_FILTER.id,
      });

    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: filterGroupWithoutDeviceFilter,
        filterOrGroupId: WORKSPACE_MEMBER_FILTER.id,
      }).children,
    ).toEqual([ROLE_FILTER]);
  });

  it('should return the same children when nothing matches', () => {
    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: 'unknown',
      }).children,
    ).toEqual(FILTER_GROUP.children);
  });
});
