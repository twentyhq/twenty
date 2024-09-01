import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { useEntitySelectSearch } from '@/object-record/relation-picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';

type useRecordIndexPageKanbanAddButtonProps = {
  recordIndexId: string;
  objectNamePlural: string;
  setIsSelectingCompany: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useRecordIndexPageKanbanAddButton = ({
  recordIndexId,
  objectNamePlural,
  setIsSelectingCompany,
}: useRecordIndexPageKanbanAddButtonProps) => {
  const dropdownId = `record-index-page-add-button-dropdown`;
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const [selectedColumnDefinition, setSelectedColumnDefinition] =
    useState<RecordBoardColumnDefinition>();
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { columnIdsState } = useRecordBoardStates(recordIndexId);
  const columnIds = useRecoilValue(columnIdsState);
  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );
  const { createOneRecord } = useCreateOneRecord({ objectNameSingular });
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  );
  const isOpportunity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity;

  const handleOpportunityClick = useCallback(
    (columnDefinition: RecordBoardColumnDefinition) => {
      setIsSelectingCompany(true);
      setSelectedColumnDefinition(columnDefinition);
      setHotkeyScopeAndMemorizePreviousScope(
        RelationPickerHotkeyScope.RelationPicker,
      );
    },
    [
      setIsSelectingCompany,
      setSelectedColumnDefinition,
      setHotkeyScopeAndMemorizePreviousScope,
    ],
  );
  const handleNonOpportunityClick = useCallback(
    (columnDefinition: RecordBoardColumnDefinition) => {
      if (selectFieldMetadataItem !== undefined)
        createOneRecord({
          [selectFieldMetadataItem.name]: columnDefinition?.value,
          position: 'first',
        });
    },
    [createOneRecord, selectFieldMetadataItem],
  );
  const { resetSearchFilter } = useEntitySelectSearch({
    relationPickerScopeId: 'relation-picker',
  });

  const handleEntitySelect = useCallback(
    (company?: EntityForSelect) => {
      setIsSelectingCompany(false);
      goBackToPreviousHotkeyScope();
      resetSearchFilter();
      if (company !== undefined && selectFieldMetadataItem !== undefined) {
        createOneRecord({
          name: company.name,
          companyId: company.id,
          position: 'first',
          [selectFieldMetadataItem.name]: selectedColumnDefinition?.value,
        });
      }
    },
    [
      createOneRecord,
      goBackToPreviousHotkeyScope,
      selectFieldMetadataItem,
      selectedColumnDefinition,
      setIsSelectingCompany,
      resetSearchFilter,
    ],
  );
  const handleCancel = useCallback(() => {
    resetSearchFilter();
    goBackToPreviousHotkeyScope();
    setIsSelectingCompany(false);
  }, [goBackToPreviousHotkeyScope, resetSearchFilter, setIsSelectingCompany]);

  return {
    dropdownId,
    columnIds,
    selectFieldMetadataItem,
    isOpportunity,
    handleOpportunityClick,
    handleNonOpportunityClick,
    handleEntitySelect,
    handleCancel,
  };
};
