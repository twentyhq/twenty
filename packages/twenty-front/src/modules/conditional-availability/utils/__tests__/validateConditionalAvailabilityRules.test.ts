import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { removeConditionalAvailabilityRowTreeNode } from '@/conditional-availability/utils/removeConditionalAvailabilityRowTreeNode';
import { validateConditionalAvailabilityRules } from '@/conditional-availability/utils/validateConditionalAvailabilityRules';

const ADMIN = '20202020-0000-4000-8000-000000000001';

const ROLE_ROW: ConditionalAvailabilityRow = {
  id: 'role-row',
  subject: 'role',
  operator: 'isAnyOf',
  values: [ADMIN],
};

const DEVICE_ROW_WITHOUT_VALUE: ConditionalAvailabilityRow = {
  id: 'device-row',
  subject: 'device',
  operator: 'is',
  values: [],
};

describe('validateConditionalAvailabilityRules', () => {
  it('should build the node of complete rows', () => {
    expect(
      validateConditionalAvailabilityRules({
        tree: {
          logicalOperator: 'AND',
          children: [{ type: 'row', row: ROLE_ROW }],
        },
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({
      status: 'valid',
      node: {
        type: 'COMPARISON',
        operator: 'EQUAL',
        left: { type: 'PATH', path: 'currentRole.universalIdentifier' },
        right: { type: 'LITERAL', value: ADMIN },
      },
    });
  });

  it('should refuse a row without value, then accept the rule once the row is removed', () => {
    const tree = {
      logicalOperator: 'AND' as const,
      children: [
        { type: 'row' as const, row: ROLE_ROW },
        {
          type: 'group' as const,
          group: {
            id: 'group-1',
            logicalOperator: 'OR' as const,
            rows: [DEVICE_ROW_WITHOUT_VALUE],
          },
        },
      ],
    };

    expect(
      validateConditionalAvailabilityRules({
        tree,
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({ status: 'invalid', reason: 'incompleteRows' });

    const treeWithoutDeviceRow = removeConditionalAvailabilityRowTreeNode({
      tree,
      nodeId: DEVICE_ROW_WITHOUT_VALUE.id,
    });

    expect(treeWithoutDeviceRow.children).toHaveLength(1);
    expect(
      validateConditionalAvailabilityRules({
        tree: treeWithoutDeviceRow,
        metadataName: 'pageLayoutWidget',
      }).status,
    ).toBe('valid');
  });

  it('should refuse a rule without any row', () => {
    expect(
      validateConditionalAvailabilityRules({
        tree: { logicalOperator: 'AND', children: [] },
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({ status: 'invalid', reason: 'noRow' });
  });
});
