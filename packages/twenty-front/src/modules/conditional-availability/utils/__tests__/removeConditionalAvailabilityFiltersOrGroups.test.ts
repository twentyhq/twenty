import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { removeConditionalAvailabilityFiltersOrGroups } from '@/conditional-availability/utils/removeConditionalAvailabilityFiltersOrGroups';

const ROLE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'role-filter',
  variable: 'currentRole',
  operator: 'isAnyOf',
  values: ['20202020-0000-4000-8000-000000000001'],
};

const MOBILE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'mobile-filter',
  variable: 'device',
  operator: 'is',
  values: ['MOBILE'],
};

const DESKTOP_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'desktop-filter',
  variable: 'device',
  operator: 'is',
  values: ['DESKTOP'],
};

const DEVICE_GROUP: ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup',
  id: 'device-group',
  logicalOperator: 'OR',
  children: [MOBILE_FILTER, DESKTOP_FILTER],
};

const FILTER_GROUP: ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup',
  id: 'root',
  logicalOperator: 'AND',
  children: [ROLE_FILTER, DEVICE_GROUP],
};

const removeById = ({
  filterGroup,
  ids,
}: {
  filterGroup: ConditionalAvailabilityFilterGroup;
  ids: string[];
}) =>
  removeConditionalAvailabilityFiltersOrGroups({
    filterGroup,
    shouldRemove: (filterOrGroup) => ids.includes(filterOrGroup.id),
  });

describe('removeConditionalAvailabilityFiltersOrGroups', () => {
  it('should remove a filter of the root and keep the rest', () => {
    expect(
      removeById({ filterGroup: FILTER_GROUP, ids: [ROLE_FILTER.id] }).children,
    ).toEqual([DEVICE_GROUP]);
  });

  it('should remove a filter inside a group and keep the group', () => {
    expect(
      removeById({ filterGroup: FILTER_GROUP, ids: [MOBILE_FILTER.id] })
        .children,
    ).toEqual([ROLE_FILTER, { ...DEVICE_GROUP, children: [DESKTOP_FILTER] }]);
  });

  it('should remove a group with all its filters', () => {
    expect(
      removeById({ filterGroup: FILTER_GROUP, ids: [DEVICE_GROUP.id] })
        .children,
    ).toEqual([ROLE_FILTER]);
  });

  it('should drop a group once its last filter is removed', () => {
    expect(
      removeById({
        filterGroup: FILTER_GROUP,
        ids: [MOBILE_FILTER.id, DESKTOP_FILTER.id],
      }).children,
    ).toEqual([ROLE_FILTER]);
  });

  it('should return the same children when nothing matches', () => {
    expect(
      removeById({ filterGroup: FILTER_GROUP, ids: ['unknown'] }).children,
    ).toEqual(FILTER_GROUP.children);
  });
});
