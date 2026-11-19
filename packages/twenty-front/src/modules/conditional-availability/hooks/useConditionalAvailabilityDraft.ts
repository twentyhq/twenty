import { conditionalAvailabilityEditorEntriesState } from '@/conditional-availability/states/conditionalAvailabilityEditorEntriesState';
import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';
import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { addConditionalAvailabilityRow } from '@/conditional-availability/utils/addConditionalAvailabilityRow';
import { addConditionalAvailabilityRowGroup } from '@/conditional-availability/utils/addConditionalAvailabilityRowGroup';
import { changeConditionalAvailabilityRowOperator } from '@/conditional-availability/utils/changeConditionalAvailabilityRowOperator';
import { createConditionalAvailabilityRow } from '@/conditional-availability/utils/createConditionalAvailabilityRow';
import { getConditionalAvailabilityAvailableSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityAvailableSubjects';
import { getConditionalAvailabilityEditorStateFromNode } from '@/conditional-availability/utils/getConditionalAvailabilityEditorStateFromNode';
import { removeConditionalAvailabilityRowTreeNode } from '@/conditional-availability/utils/removeConditionalAvailabilityRowTreeNode';
import { setConditionalAvailabilityRowTreeLogicalOperator } from '@/conditional-availability/utils/setConditionalAvailabilityRowTreeLogicalOperator';
import { updateConditionalAvailabilityRow } from '@/conditional-availability/utils/updateConditionalAvailabilityRow';
import { validateConditionalAvailabilityEditorState } from '@/conditional-availability/utils/validateConditionalAvailabilityEditorState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMemo } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type ConditionalAvailabilityLogicalOperator,
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type UseConditionalAvailabilityDraftProps = {
  metadataName: ConditionalAvailabilityMetadataName;
  itemKey: string;
  node: ConditionalAvailabilityNode | null;
  fields: FieldMetadataItem[];
  hasRolesPermission: boolean;
  onNodeChange: (node: ConditionalAvailabilityNode | null) => void;
};

export const useConditionalAvailabilityDraft = ({
  metadataName,
  itemKey,
  node,
  fields,
  hasRolesPermission,
  onNodeChange,
}: UseConditionalAvailabilityDraftProps) => {
  const [
    conditionalAvailabilityEditorEntries,
    setConditionalAvailabilityEditorEntries,
  ] = useAtomState(conditionalAvailabilityEditorEntriesState);

  const storedEditorState = useMemo(
    () =>
      getConditionalAvailabilityEditorStateFromNode({
        node,
        metadataName,
        fields,
      }),
    [node, metadataName, fields],
  );

  const editorEntry = conditionalAvailabilityEditorEntries[itemKey];

  const editorState: ConditionalAvailabilityEditorState =
    isDefined(editorEntry) && isDeeplyEqual(editorEntry.storedNode, node)
      ? editorEntry.editorState
      : storedEditorState;

  const availableSubjects = getConditionalAvailabilityAvailableSubjects({
    metadataName,
    hasRolesPermission,
  });

  const writeEditorState = (
    nextEditorState: ConditionalAvailabilityEditorState,
  ) => {
    const validation = validateConditionalAvailabilityEditorState({
      editorState: nextEditorState,
      metadataName,
    });

    const nextNode = validation.status === 'valid' ? validation.node : node;

    setConditionalAvailabilityEditorEntries((previousEditorEntries) => ({
      ...previousEditorEntries,
      [itemKey]: {
        metadataName,
        storedNode: nextNode,
        editorState: nextEditorState,
      },
    }));

    if (validation.status === 'valid' && !isDeeplyEqual(nextNode, node)) {
      onNodeChange(validation.node);
    }
  };

  const createDefaultRow = (): ConditionalAvailabilityRow | null => {
    const [subject] = availableSubjects;

    return isDefined(subject)
      ? createConditionalAvailabilityRow({ id: v4(), rowSubject: { subject } })
      : null;
  };

  const createDefaultTree = (): ConditionalAvailabilityRowTree => {
    const row = createDefaultRow();

    return {
      logicalOperator: doNotTranslate('AND'),
      children: isDefined(row) ? [{ type: 'row', row }] : [],
    };
  };

  const updateTree = (
    getNextTree: (
      tree: ConditionalAvailabilityRowTree,
    ) => ConditionalAvailabilityRowTree,
  ) => {
    if (editorState.mode !== 'customRule') {
      return;
    }

    writeEditorState({
      mode: 'customRule',
      tree: getNextTree(editorState.tree),
    });
  };

  const updateRow = ({
    rowId,
    update,
  }: {
    rowId: string;
    update: (row: ConditionalAvailabilityRow) => ConditionalAvailabilityRow;
  }) => {
    updateTree((tree) =>
      updateConditionalAvailabilityRow({ tree, rowId, update }),
    );
  };

  const chooseEveryone = () => {
    writeEditorState({ mode: 'everyone' });
  };

  const chooseCustomRule = () => {
    if (editorState.mode !== 'everyone') {
      return;
    }

    writeEditorState({ mode: 'customRule', tree: createDefaultTree() });
  };

  const addRow = (groupId: string | null) => {
    const row = createDefaultRow();

    if (!isDefined(row)) {
      return;
    }

    updateTree((tree) => addConditionalAvailabilityRow({ tree, row, groupId }));
  };

  const addGroup = () => {
    const row = createDefaultRow();

    if (!isDefined(row)) {
      return;
    }

    updateTree((tree) =>
      addConditionalAvailabilityRowGroup({ tree, groupId: v4(), row }),
    );
  };

  const removeNode = (nodeId: string) => {
    updateTree((tree) =>
      removeConditionalAvailabilityRowTreeNode({ tree, nodeId }),
    );
  };

  const setLogicalOperator = ({
    groupId,
    logicalOperator,
  }: {
    groupId: string | null;
    logicalOperator: ConditionalAvailabilityLogicalOperator;
  }) => {
    updateTree((tree) =>
      setConditionalAvailabilityRowTreeLogicalOperator({
        tree,
        groupId,
        logicalOperator,
      }),
    );
  };

  const changeRowSubject = ({
    rowId,
    rowSubject,
  }: {
    rowId: string;
    rowSubject: ConditionalAvailabilityRowSubject;
  }) => {
    updateRow({
      rowId,
      update: (row) =>
        createConditionalAvailabilityRow({ id: rowId, rowSubject }) ?? row,
    });
  };

  const changeRowOperator = ({
    rowId,
    operator,
  }: {
    rowId: string;
    operator: ConditionalAvailabilityOperator;
  }) => {
    updateRow({
      rowId,
      update: (row) =>
        changeConditionalAvailabilityRowOperator({ row, operator }),
    });
  };

  const changeRowValues = ({
    rowId,
    values,
  }: {
    rowId: string;
    values: string[];
  }) => {
    updateRow({ rowId, update: (row) => ({ ...row, values }) });
  };

  const replaceWithRules = () => {
    writeEditorState({ mode: 'customRule', tree: createDefaultTree() });
  };

  return {
    editorState,
    availableSubjects,
    chooseEveryone,
    chooseCustomRule,
    addRow,
    addGroup,
    removeNode,
    setLogicalOperator,
    changeRowSubject,
    changeRowOperator,
    changeRowValues,
    replaceWithRules,
  };
};
