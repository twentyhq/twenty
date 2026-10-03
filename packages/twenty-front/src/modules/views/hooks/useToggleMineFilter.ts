import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isToggleMineSelectedPerViewState } from '@/views/states/isToggleMineSelectedPerViewState';
import { omitToggleMineRecordFilter } from '@/views/utils/omitToggleMineRecordFilter';
import { isDefined } from 'twenty-shared/utils';

type UseToggleMineFilterParams = {
  viewBarId: string;
  objectNameSingular: string;
};

export const useToggleMineFilter = ({
  viewBarId,
  objectNameSingular,
}: UseToggleMineFilterParams) => {
  const { currentView } = useGetCurrentViewOnly();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    viewBarId,
  );

  const isToggleMineSelectedPerView = useAtomStateValue(
    isToggleMineSelectedPerViewState,
  );

  const toggleMineFilterFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === currentView?.toggleMineFilterFieldMetadataId,
  );

  // Any other filter on the field would be AND-ed with "Me" and usually empty the list
  const isToggleMineFilterBlocked =
    isDefined(toggleMineFilterFieldMetadataItem) &&
    omitToggleMineRecordFilter(currentRecordFilters).some(
      (recordFilter) =>
        recordFilter.fieldMetadataId === toggleMineFilterFieldMetadataItem.id,
    );

  const viewId = currentView?.id;

  return {
    viewId,
    currentRecordFilters,
    toggleMineFilterFieldMetadataItem,
    isToggleMineFilterBlocked,
    isMineSelected:
      isDefined(viewId) && isToggleMineSelectedPerView[viewId] === true,
    isMineSelectionInitialized:
      isDefined(viewId) && isDefined(isToggleMineSelectedPerView[viewId]),
  };
};
