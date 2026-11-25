import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { removeConditionalAvailabilityFiltersOrGroups } from '@/conditional-availability/utils/removeConditionalAvailabilityFiltersOrGroups';
import { updateConditionalAvailabilityFilter } from '@/conditional-availability/utils/updateConditionalAvailabilityFilter';
import { updateConditionalAvailabilityFilterGroup } from '@/conditional-availability/utils/updateConditionalAvailabilityFilterGroup';
import { validateConditionalAvailabilityEditorState } from '@/conditional-availability/utils/validateConditionalAvailabilityEditorState';
import { buildDeviceConditionalAvailability } from 'twenty-shared/conditional-availability';

const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';

const ROLE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'role-filter',
  variable: 'currentRole',
  operator: 'isAnyOf',
  values: [ADMIN_ROLE_UNIVERSAL_IDENTIFIER],
};

const DEVICE_FILTER_WITHOUT_VALUE: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'device-filter',
  variable: 'device',
  operator: 'is',
  values: [],
};

const ROLE_NODE = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'VARIABLE', path: 'currentRole.universalIdentifier' },
  right: { type: 'LITERAL', value: ADMIN_ROLE_UNIVERSAL_IDENTIFIER },
};

const FILTER_GROUP: ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup',
  id: 'root',
  logicalOperator: 'AND',
  children: [
    ROLE_FILTER,
    {
      type: 'filterGroup',
      id: 'group-1',
      logicalOperator: 'OR',
      children: [DEVICE_FILTER_WITHOUT_VALUE],
    },
  ],
};

const validateFilterGroup = (filterGroup: ConditionalAvailabilityFilterGroup) =>
  validateConditionalAvailabilityEditorState({
    editorState: { mode: 'customRule', filterGroup },
    metadataName: 'pageLayoutWidget',
  });

describe('validateConditionalAvailabilityEditorState', () => {
  it('should return no node for everyone', () => {
    expect(
      validateConditionalAvailabilityEditorState({
        editorState: { mode: 'everyone' },
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({ status: 'valid', node: null });
  });

  it('should refuse a rule the builder has no filters for', () => {
    expect(
      validateConditionalAvailabilityEditorState({
        editorState: { mode: 'unsupportedRule' },
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({ status: 'invalid', reason: 'unsupportedRule' });
  });

  it('should return no node when no filter has a value', () => {
    expect(validateFilterGroup({ ...FILTER_GROUP, children: [] })).toEqual({
      status: 'valid',
      node: null,
    });

    expect(
      validateFilterGroup({
        ...FILTER_GROUP,
        children: [DEVICE_FILTER_WITHOUT_VALUE],
      }),
    ).toEqual({ status: 'valid', node: null });
  });

  it('should refuse a filter holding the same value twice', () => {
    expect(
      validateFilterGroup({
        ...FILTER_GROUP,
        children: [
          {
            ...ROLE_FILTER,
            values: [
              ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
              ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
            ],
          },
        ],
      }),
    ).toEqual({ status: 'invalid', reason: 'invalidFilters' });
  });

  it('should skip a filter without value, and write it once it has one', () => {
    expect(validateFilterGroup(FILTER_GROUP)).toEqual({
      status: 'valid',
      node: ROLE_NODE,
    });

    const filterGroupWithMobileDevice = updateConditionalAvailabilityFilter({
      filterGroup: FILTER_GROUP,
      filterId: DEVICE_FILTER_WITHOUT_VALUE.id,
      update: (filter) => ({ ...filter, values: ['MOBILE'] }),
    });

    expect(validateFilterGroup(filterGroupWithMobileDevice)).toEqual({
      status: 'valid',
      node: {
        type: 'GROUP',
        logicalOperator: 'AND',
        children: [ROLE_NODE, buildDeviceConditionalAvailability('MOBILE')],
      },
    });
  });

  it('should drop a group with its last filter', () => {
    const filterGroupWithoutDeviceFilter =
      removeConditionalAvailabilityFiltersOrGroups({
        filterGroup: FILTER_GROUP,
        shouldRemove: (filterOrGroup) =>
          filterOrGroup.id === DEVICE_FILTER_WITHOUT_VALUE.id,
      });

    expect(filterGroupWithoutDeviceFilter.children).toEqual([ROLE_FILTER]);
    expect(validateFilterGroup(filterGroupWithoutDeviceFilter)).toEqual({
      status: 'valid',
      node: ROLE_NODE,
    });
  });

  it('should join the filters of the root with "or" once its operator is changed', () => {
    const filterGroupJoinedWithOr = updateConditionalAvailabilityFilterGroup({
      filterGroup: updateConditionalAvailabilityFilterGroup({
        filterGroup: FILTER_GROUP,
        filterGroupId: 'group-1',
        update: (filterGroup) => ({
          ...filterGroup,
          children: [{ ...DEVICE_FILTER_WITHOUT_VALUE, values: ['DESKTOP'] }],
        }),
      }),
      filterGroupId: FILTER_GROUP.id,
      update: (filterGroup) => ({ ...filterGroup, logicalOperator: 'OR' }),
    });

    expect(validateFilterGroup(filterGroupJoinedWithOr)).toEqual({
      status: 'valid',
      node: {
        type: 'GROUP',
        logicalOperator: 'OR',
        children: [ROLE_NODE, buildDeviceConditionalAvailability('DESKTOP')],
      },
    });
  });
});
