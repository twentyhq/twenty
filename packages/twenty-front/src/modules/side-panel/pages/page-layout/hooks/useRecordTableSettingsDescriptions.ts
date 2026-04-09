import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

const PLACEHOLDER_INSTANCE_ID =
  'record-table-settings-descriptions-placeholder';

type UseRecordTableSettingsDescriptionsParams = {
  objectMetadataId: string | null | undefined;
  viewId: string | null;
};

export const useRecordTableSettingsDescriptions = ({
  objectMetadataId,
  viewId,
}: UseRecordTableSettingsDescriptionsParams) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { view } = useViewById(viewId);

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === objectMetadataId,
  );

  const recordIndexId =
    isDefined(viewId) && isDefined(sourceObjectMetadataItem)
      ? getRecordIndexIdFromObjectNamePluralAndViewId(
          sourceObjectMetadataItem.namePlural,
          viewId,
        )
      : PLACEHOLDER_INSTANCE_ID;

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
    recordIndexId,
  );

  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
    recordIndexId,
  );

  const hasViewId = isDefined(viewId);

  const activeVisibleFieldLabels: Array<string | undefined> = hasViewId
    ? currentRecordFields
        .filter((field) => field.isVisible)
        .map(
          (field) =>
            sourceObjectMetadataItem?.fields.find(
              (metaField) => metaField.id === field.fieldMetadataItemId,
            )?.label,
        )
    : [];

  const activeFilterLabels: Array<string | undefined> =
    currentRecordFilters.length > 0
      ? currentRecordFilters.map((filter) => filter.label)
      : (view?.viewFilters ?? []).map(
          (filter) =>
            sourceObjectMetadataItem?.fields.find(
              (field) => field.id === filter.fieldMetadataId,
            )?.label,
        );

  const activeSortLabels: Array<string | undefined> = (
    currentRecordSorts.length > 0 ? currentRecordSorts : (view?.viewSorts ?? [])
  ).map(
    (sort) =>
      sourceObjectMetadataItem?.fields.find(
        (field) => field.id === sort.fieldMetadataId,
      )?.label,
  );

  const sourceDescription = sourceObjectMetadataItem?.labelPlural;

  const fieldsDescription =
    activeVisibleFieldLabels.length === 1
      ? activeVisibleFieldLabels[0]
      : activeVisibleFieldLabels.length > 1
        ? t`${activeVisibleFieldLabels.length} shown`
        : undefined;

  const filterDescription =
    activeFilterLabels.length === 1
      ? activeFilterLabels[0]
      : activeFilterLabels.length > 1
        ? t`${activeFilterLabels.length} shown`
        : undefined;

  const sortDescription =
    activeSortLabels.length === 1
      ? activeSortLabels[0]
      : activeSortLabels.length > 1
        ? t`${activeSortLabels.length} shown`
        : undefined;

  return {
    sourceDescription,
    fieldsDescription,
    filterDescription,
    sortDescription,
  };
};
