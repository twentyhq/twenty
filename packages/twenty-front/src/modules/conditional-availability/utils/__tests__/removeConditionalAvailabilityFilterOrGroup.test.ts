import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { removeConditionalAvailabilityFilterOrGroup } from '@/conditional-availability/utils/removeConditionalAvailabilityFilterOrGroup';

const ROLE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'role-filter',
  variable: 'currentRole',
  operator: 'EQUAL',
  values: ['20202020-0000-4000-8000-000000000001'],
};

const MOBILE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'mobile-filter',
  variable: 'device',
  operator: 'EQUAL',
  values: ['MOBILE'],
};

const DESKTOP_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'desktop-filter',
  variable: 'device',
  operator: 'EQUAL',
  values: ['DESKTOP'],
};

const DEVICE_GROUP: ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup',
  id: 'device-group',
  logicalOperator: 'AND',
  children: [MOBILE_FILTER, DESKTOP_FILTER],
};

const FILTER_GROUP: ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup',
  id: 'root',
  logicalOperator: 'AND',
  children: [ROLE_FILTER, DEVICE_GROUP],
};

describe('removeConditionalAvailabilityFilterOrGroup', () => {
  it('should remove a filter of the root and keep the rest', () => {
    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: ROLE_FILTER.id,
      }).children,
    ).toEqual([DEVICE_GROUP]);
  });

  it('should remove a filter inside a group and keep the group', () => {
    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: MOBILE_FILTER.id,
      }).children,
    ).toEqual([ROLE_FILTER, { ...DEVICE_GROUP, children: [DESKTOP_FILTER] }]);
  });

  it('should remove a group with all its filters', () => {
    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: DEVICE_GROUP.id,
      }).children,
    ).toEqual([ROLE_FILTER]);
  });

  it('should drop a group once its last filter is removed', () => {
    const filterGroupWithoutMobileFilter =
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: FILTER_GROUP,
        filterOrGroupId: MOBILE_FILTER.id,
      });

    expect(
      removeConditionalAvailabilityFilterOrGroup({
        filterGroup: filterGroupWithoutMobileFilter,
        filterOrGroupId: DESKTOP_FILTER.id,
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
