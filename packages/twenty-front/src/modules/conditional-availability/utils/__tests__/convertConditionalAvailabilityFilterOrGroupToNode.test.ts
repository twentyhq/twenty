import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { convertConditionalAvailabilityFilterOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityFilterOrGroupToNode';
import { createEmptyConditionalAvailabilityFilter } from '@/conditional-availability/utils/createEmptyConditionalAvailabilityFilter';
import { updateConditionalAvailabilityFilter } from '@/conditional-availability/utils/updateConditionalAvailabilityFilter';
import { updateConditionalAvailabilityFilterGroup } from '@/conditional-availability/utils/updateConditionalAvailabilityFilterGroup';
import { updateConditionalAvailabilityFilterOperator } from '@/conditional-availability/utils/updateConditionalAvailabilityFilterOperator';
import { buildDeviceConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';

const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';

const ROLE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'role-filter',
  variable: 'currentRole',
  operator: 'isAnyOf',
  values: [ADMIN_ROLE_UNIVERSAL_IDENTIFIER],
};

const DEVICE_FILTER_WITHOUT_VALUE: ConditionalAvailabilityFilter = {
  ...createEmptyConditionalAvailabilityFilter({ variable: 'device' }),
  id: 'device-filter',
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

const convertToNode = (filterGroup: ConditionalAvailabilityFilterGroup) =>
  convertConditionalAvailabilityFilterOrGroupToNode({
    filterOrGroup: filterGroup,
  });

describe('convertConditionalAvailabilityFilterOrGroupToNode', () => {
  it('should write no node when no filter has a value', () => {
    expect(convertToNode({ ...FILTER_GROUP, children: [] })).toBeNull();
    expect(
      convertToNode({
        ...FILTER_GROUP,
        children: [DEVICE_FILTER_WITHOUT_VALUE],
      }),
    ).toBeNull();
  });

  it('should skip a filter without value, and write it once it has one', () => {
    expect(convertToNode(FILTER_GROUP)).toEqual(ROLE_NODE);

    const filterGroupWithMobileDevice = updateConditionalAvailabilityFilter({
      filterGroup: FILTER_GROUP,
      filterId: DEVICE_FILTER_WITHOUT_VALUE.id,
      update: (filter) => ({ ...filter, values: ['MOBILE'] }),
    });

    expect(convertToNode(filterGroupWithMobileDevice)).toEqual({
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [ROLE_NODE, buildDeviceConditionalEvaluationNode('MOBILE')],
    });
  });

  it('should join "is any of" values with "or" and "is none of" values with "and"', () => {
    const roleFilterWithTwoValues: ConditionalAvailabilityFilter = {
      ...ROLE_FILTER,
      values: [
        ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
        SALES_ROLE_UNIVERSAL_IDENTIFIER,
      ],
    };

    expect(
      convertToNode({ ...FILTER_GROUP, children: [roleFilterWithTwoValues] }),
    ).toMatchObject({ type: 'GROUP', logicalOperator: 'OR' });

    expect(
      convertToNode({
        ...FILTER_GROUP,
        children: [
          updateConditionalAvailabilityFilterOperator({
            filter: roleFilterWithTwoValues,
            operator: 'isNoneOf',
          }),
        ],
      }),
    ).toMatchObject({ type: 'GROUP', logicalOperator: 'AND' });
  });

  it('should clear the values when the new operator holds one value and the filter has several', () => {
    const workspaceMemberFilter: ConditionalAvailabilityFilter = {
      type: 'filter',
      id: 'workspace-member-filter',
      variable: 'currentWorkspaceMember',
      operator: 'isAnyOf',
      values: ['member-1', 'member-2'],
    };

    expect(
      updateConditionalAvailabilityFilterOperator({
        filter: workspaceMemberFilter,
        operator: 'is',
      }),
    ).toEqual({ ...workspaceMemberFilter, operator: 'is', values: [] });

    expect(
      updateConditionalAvailabilityFilterOperator({
        filter: workspaceMemberFilter,
        operator: 'isNoneOf',
      }),
    ).toEqual({ ...workspaceMemberFilter, operator: 'isNoneOf' });
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

    expect(convertToNode(filterGroupJoinedWithOr)).toEqual({
      type: 'GROUP',
      logicalOperator: 'OR',
      children: [ROLE_NODE, buildDeviceConditionalEvaluationNode('DESKTOP')],
    });
  });
});
