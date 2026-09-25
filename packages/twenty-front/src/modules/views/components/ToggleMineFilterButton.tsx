import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { computeToggleMineRecordFilter } from '@/views/utils/computeToggleMineRecordFilter';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { v4 } from 'uuid';

type ToggleMineFilterButtonProps = {
  viewBarId: string;
  objectNameSingular: string;
};

export const ToggleMineFilterButton = ({
  viewBarId,
  objectNameSingular,
}: ToggleMineFilterButtonProps) => {
  const { currentView } = useGetCurrentViewOnly();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    viewBarId,
  );

  const { upsertRecordFilter } = useUpsertRecordFilter(viewBarId);
  const { removeRecordFilter } = useRemoveRecordFilter(viewBarId);

  const toggleMineFilterFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === currentView?.toggleMineFilterFieldMetadataId,
  );

  if (!isDefined(toggleMineFilterFieldMetadataItem)) {
    return null;
  }

  const { isMineSelected, toggleAction } = computeToggleMineRecordFilter({
    currentRecordFilters,
    toggleMineFilterFieldMetadataItem,
    newRecordFilterId: v4(),
  });

  const handleClick = () => {
    if (toggleAction.type === 'remove') {
      removeRecordFilter({ recordFilterId: toggleAction.recordFilterId });
      return;
    }

    upsertRecordFilter(toggleAction.recordFilter);
  };

  return (
    <Button
      size="sm"
      variant={isMineSelected ? 'solid' : 'outline'}
      color={isMineSelected ? 'accent' : 'neutral'}
      onClick={handleClick}
    >
      {isMineSelected ? t`Mine` : t`All`}
    </Button>
  );
};
