import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordBoardNewOpportunityByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewOpportunityByColumnIdSelector';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useCallback, useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

export const useAddNewOpportunity = () => {
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);
  const columnContext = useContext(RecordBoardColumnContext);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const getColumnDefinitionId = useCallback(
    (columnId?: string) => {
      const columnDefinitionId = columnId || columnContext?.columnDefinition.id;
      if (!columnDefinitionId) {
        throw new Error('Column ID is required');
      }
      return columnDefinitionId;
    },
    [columnContext],
  );

  const addNewOpportunity = useCallback(
    (set: any, columnDefinitionId: string, position: 'first' | 'last') => {
      set(
        recordBoardNewOpportunityByColumnIdSelector({
          familyKey: columnDefinitionId,
          scopeId: columnDefinitionId,
        }),
        {
          id: v4(),
          columnId: columnDefinitionId,
          isCreating: true,
          position,
        },
      );
    },
    [],
  );
  const createOpportunity = useCallback(
    (company: EntityForSelect, position: 'first' | 'last') => {
      createOneRecord({
        [selectFieldMetadataItem.name]: columnContext?.columnDefinition.value,
        position,
        companyId: company?.id,
        name: company?.name,
      });
    },
    [createOneRecord, columnContext, selectFieldMetadataItem],
  );

  const handleCancel = useRecoilCallback(
    ({ set }) =>
      (position: 'first' | 'last', columnId?: string): void => {
        const columnDefinitionId = getColumnDefinitionId(columnId);
        set(
          recordBoardNewOpportunityByColumnIdSelector({
            familyKey: columnDefinitionId,
            scopeId: columnDefinitionId,
          }),
          {
            id: '',
            columnId: columnDefinitionId,
            isCreating: false,
            position,
            company: null,
          },
        );
        goBackToPreviousHotkeyScope();
      },
    [getColumnDefinitionId, goBackToPreviousHotkeyScope],
  );

  const handleAddNewOpportunityClick = useRecoilCallback(
    ({ set }) =>
      (position: 'first' | 'last', columnId?: string): void => {
        const columnDefinitionId = getColumnDefinitionId(columnId);
        addNewOpportunity(set, columnDefinitionId, position);
        setHotkeyScopeAndMemorizePreviousScope(
          RelationPickerHotkeyScope.RelationPicker,
        );
      },
    [
      addNewOpportunity,

      setHotkeyScopeAndMemorizePreviousScope,
      getColumnDefinitionId,
    ],
  );

  const handleEntitySelect = useCallback(
    (
      position: 'first' | 'last',
      company: EntityForSelect,
      columnId?: string,
    ) => {
      const columnDefinitionId = getColumnDefinitionId(columnId);
      createOpportunity(company, position);
      goBackToPreviousHotkeyScope();
      handleCancel(position, columnDefinitionId);
    },
    [
      createOpportunity,
      handleCancel,
      getColumnDefinitionId,
      goBackToPreviousHotkeyScope,
    ],
  );

  return {
    handleAddNewOpportunityClick,
    handleEntitySelect,
    handleCancel,
  };
};
