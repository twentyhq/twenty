import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';
import { removeConditionalAvailabilityRowsOrGroups } from '@/conditional-availability/utils/removeConditionalAvailabilityRowsOrGroups';
import { updateConditionalAvailabilityRow } from '@/conditional-availability/utils/updateConditionalAvailabilityRow';
import { updateConditionalAvailabilityRowGroup } from '@/conditional-availability/utils/updateConditionalAvailabilityRowGroup';
import { validateConditionalAvailabilityEditorState } from '@/conditional-availability/utils/validateConditionalAvailabilityEditorState';
import { buildDeviceConditionalAvailability } from 'twenty-shared/conditional-availability';

const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';

const ROLE_ROW: ConditionalAvailabilityRow = {
  type: 'row',
  id: 'role-row',
  subject: 'role',
  operator: 'isAnyOf',
  values: [ADMIN_ROLE_UNIVERSAL_IDENTIFIER],
};

const DEVICE_ROW_WITHOUT_VALUE: ConditionalAvailabilityRow = {
  type: 'row',
  id: 'device-row',
  subject: 'device',
  operator: 'is',
  values: [],
};

const ROLE_NODE = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'VARIABLE', path: 'currentRole.universalIdentifier' },
  right: { type: 'LITERAL', value: ADMIN_ROLE_UNIVERSAL_IDENTIFIER },
};

const ROW_TREE: ConditionalAvailabilityRowGroup = {
  type: 'group',
  id: 'root',
  logicalOperator: 'AND',
  children: [
    ROLE_ROW,
    {
      type: 'group',
      id: 'group-1',
      logicalOperator: 'OR',
      children: [DEVICE_ROW_WITHOUT_VALUE],
    },
  ],
};

const validateRowTree = (rowTree: ConditionalAvailabilityRowGroup) =>
  validateConditionalAvailabilityEditorState({
    editorState: { mode: 'customRule', rowTree },
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

  it('should refuse a rule the builder has no rows for', () => {
    expect(
      validateConditionalAvailabilityEditorState({
        editorState: { mode: 'unsupportedRule' },
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({ status: 'invalid', reason: 'unsupportedRule' });
  });

  it('should return no node when no row has a value', () => {
    expect(validateRowTree({ ...ROW_TREE, children: [] })).toEqual({
      status: 'valid',
      node: null,
    });

    expect(
      validateRowTree({ ...ROW_TREE, children: [DEVICE_ROW_WITHOUT_VALUE] }),
    ).toEqual({ status: 'valid', node: null });
  });

  it('should refuse a row holding the same value twice', () => {
    expect(
      validateRowTree({
        ...ROW_TREE,
        children: [
          {
            ...ROLE_ROW,
            values: [
              ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
              ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
            ],
          },
        ],
      }),
    ).toEqual({ status: 'invalid', reason: 'invalidRows' });
  });

  it('should skip a row without value, and write it once it has one', () => {
    expect(validateRowTree(ROW_TREE)).toEqual({
      status: 'valid',
      node: ROLE_NODE,
    });

    const rowTreeWithMobileDevice = updateConditionalAvailabilityRow({
      rowGroup: ROW_TREE,
      rowId: DEVICE_ROW_WITHOUT_VALUE.id,
      update: (row) => ({ ...row, values: ['MOBILE'] }),
    });

    expect(validateRowTree(rowTreeWithMobileDevice)).toEqual({
      status: 'valid',
      node: {
        type: 'GROUP',
        logicalOperator: 'AND',
        children: [ROLE_NODE, buildDeviceConditionalAvailability('MOBILE')],
      },
    });
  });

  it('should drop a group with its last row', () => {
    const rowTreeWithoutDeviceRow = removeConditionalAvailabilityRowsOrGroups({
      rowGroup: ROW_TREE,
      shouldRemove: (rowOrGroup) =>
        rowOrGroup.id === DEVICE_ROW_WITHOUT_VALUE.id,
    });

    expect(rowTreeWithoutDeviceRow.children).toEqual([ROLE_ROW]);
    expect(validateRowTree(rowTreeWithoutDeviceRow)).toEqual({
      status: 'valid',
      node: ROLE_NODE,
    });
  });

  it('should join the rows of the root with "or" once its operator is changed', () => {
    const rowTreeJoinedWithOr = updateConditionalAvailabilityRowGroup({
      rowGroup: updateConditionalAvailabilityRowGroup({
        rowGroup: ROW_TREE,
        groupId: 'group-1',
        update: (rowGroup) => ({
          ...rowGroup,
          children: [{ ...DEVICE_ROW_WITHOUT_VALUE, values: ['DESKTOP'] }],
        }),
      }),
      groupId: ROW_TREE.id,
      update: (rowGroup) => ({ ...rowGroup, logicalOperator: 'OR' }),
    });

    expect(validateRowTree(rowTreeJoinedWithOr)).toEqual({
      status: 'valid',
      node: {
        type: 'GROUP',
        logicalOperator: 'OR',
        children: [ROLE_NODE, buildDeviceConditionalAvailability('DESKTOP')],
      },
    });
  });
});
