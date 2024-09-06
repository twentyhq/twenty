import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useIsOpportunitiesCompanyFieldDisabled } from '@/object-record/record-board/record-board-column/hooks/useIsOpportunitiesCompanyFieldDisabled';
import { useEntitySelectSearch } from '@/object-record/relation-picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useCallback, useContext, useState } from 'react';
import { isDefined } from 'twenty-ui';

export const useAddNewOpportunity = (position: string) => {
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();
  const { resetSearchFilter } = useEntitySelectSearch({
    relationPickerScopeId: 'relation-picker',
  });
  const { isOpportunitiesCompanyFieldDisabled } =
    useIsOpportunitiesCompanyFieldDisabled();
  const handleEntitySelect = useCallback(
    (company?: EntityForSelect) => {
      setIsCreatingCard(false);
      goBackToPreviousHotkeyScope();
      resetSearchFilter();
      createOneRecord({
        name: company?.name,
        companyId: company?.id,
        position: position,
        [selectFieldMetadataItem.name]: columnDefinition.value,
      });
    },
    [
      columnDefinition,
      createOneRecord,
      goBackToPreviousHotkeyScope,
      resetSearchFilter,
      selectFieldMetadataItem,
      position,
    ],
  );

  const handleAddNewOpportunityClick = useCallback(() => {
    if (isOpportunitiesCompanyFieldDisabled) {
      handleEntitySelect();
    } else {
      setIsCreatingCard(true);
    }
    setHotkeyScopeAndMemorizePreviousScope(
      RelationPickerHotkeyScope.RelationPicker,
    );
  }, [
    setHotkeyScopeAndMemorizePreviousScope,
    isOpportunitiesCompanyFieldDisabled,
    handleEntitySelect,
  ]);

  const handleCancel = useCallback(() => {
    resetSearchFilter();
    goBackToPreviousHotkeyScope();
    setIsCreatingCard(false);
  }, [goBackToPreviousHotkeyScope, resetSearchFilter]);

  return {
    isCreatingCard,
    handleEntitySelect,
    handleAddNewOpportunityClick,
    handleCancel,
  };
};
