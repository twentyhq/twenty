/* oxlint-disable twenty/no-navigate-prefer-link */
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { RecordListEmptyStateDisplay } from '@/object-record/record-list/components/RecordListEmptyStateDisplay';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { getEmptyStateSubTitle } from '@/object-record/record-table/empty-state/utils/getEmptyStateSubTitle';
import { getEmptyStateTitle } from '@/object-record/record-table/empty-state/utils/getEmptyStateTitle';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconFilterOff, IconPlus, IconSettings } from 'twenty-ui/icon';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const RecordListEmptyState = () => {
  const { t } = useLingui();

  const {
    objectMetadataItem,
    objectNameSingular,
    objectPermissions,
    viewBarInstanceId,
  } = useRecordListContextOrThrow();

  const objectLabelSingular = useObjectLabel(objectMetadataItem);

  const navigate = useNavigateSettings();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const { totalCount } = useFindManyRecords({ objectNameSingular, limit: 1 });

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { isRecordFilterAboutSoftDelete } = useCheckIsSoftDeleteFilter();
  const { removeRecordFilter } = useRemoveRecordFilter();
  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId: viewBarInstanceId,
  });

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const canCreateRecords =
    !isLayoutCustomizationModeEnabled &&
    canCreateRecordsForObjectMetadataItem({
      objectPermissions,
      objectMetadataItem,
    });

  if (!objectPermissions.canUpdateObjectRecords) {
    return (
      <RecordListEmptyStateDisplay
        animatedPlaceholderType="noRecord"
        title={t`No records found`}
        subTitle={t`You are not allowed to create records for this object`}
      />
    );
  }

  if (objectMetadataItem.isRemote) {
    return (
      <RecordListEmptyStateDisplay
        animatedPlaceholderType="noRecord"
        title={t`No Data Available for Remote Table`}
        subTitle={t`If this is unexpected, please verify your settings.`}
        ButtonIcon={IconSettings}
        buttonTitle={t`Go to Settings`}
        onButtonClick={() => navigate(SettingsPath.Integrations)}
      />
    );
  }

  if (hasAnySoftDeleteFilterOnView) {
    const handleRemoveDeletedFilterClick = () => {
      const deletedFilter = currentRecordFilters.find(
        isRecordFilterAboutSoftDelete,
      );

      if (!isDefined(deletedFilter)) {
        return;
      }

      removeRecordFilter({ recordFilterId: deletedFilter.id });
      toggleSoftDeleteFilterState(false);
    };

    return (
      <RecordListEmptyStateDisplay
        animatedPlaceholderType="noDeletedRecord"
        title={t`No Deleted ${objectLabelSingular} found`}
        subTitle={t`No deleted records matching the filter criteria were found.`}
        ButtonIcon={IconFilterOff}
        buttonTitle={t`Remove Deleted filter`}
        onButtonClick={handleRemoveDeletedFilterClick}
      />
    );
  }

  const hasNoRecordAtAll = totalCount === 0;

  return (
    <RecordListEmptyStateDisplay
      animatedPlaceholderType={hasNoRecordAtAll ? 'noRecord' : 'noMatchRecord'}
      title={
        hasNoRecordAtAll
          ? getEmptyStateTitle(
              objectMetadataItem.nameSingular,
              objectLabelSingular,
            )
          : t`No ${objectLabelSingular} found`
      }
      subTitle={
        hasNoRecordAtAll
          ? getEmptyStateSubTitle(
              objectMetadataItem.nameSingular,
              objectLabelSingular,
            )
          : t`No records matching the filter criteria were found.`
      }
      ButtonIcon={IconPlus}
      buttonTitle={
        canCreateRecords ? t`Add a ${objectLabelSingular}` : undefined
      }
      onButtonClick={() => createNewIndexRecord()}
    />
  );
};
