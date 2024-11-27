import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerSearchFilterComponentState } from '@/object-record/relation-picker/states/recordPickerSearchFilterComponentState';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useRecordPickerRecordsOptions = ({
  objectNameSingular,
  selectedRelationRecordIds = [],
  excludedRelationRecordIds = [],
}: {
  objectNameSingular: string;
  selectedRelationRecordIds?: string[];
  excludedRelationRecordIds?: string[];
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
  );

  const recordPickerSearchFilter = useRecoilComponentValueV2(
    recordPickerSearchFilterComponentState,
    instanceId,
  );

  const records = useFilteredSearchEntityQuery({
    searchFilter: recordPickerSearchFilter,
    selectedIds: selectedRelationRecordIds,
    excludeRecordIds: excludedRelationRecordIds,
    objectNameSingular,
  });

  return { records, recordPickerSearchFilter };
};
