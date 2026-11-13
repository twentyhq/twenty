import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { isCurrentRecordViewFilter } from '@/page-layout/widgets/record-table/utils/isCurrentRecordViewFilter';
import { isDefined } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

const PLACEHOLDER_INSTANCE_ID =
  'record-table-settings-descriptions-placeholder';

type UseRecordTableSettingsDescriptionsParams = {
  objectMetadataId: string | null | undefined;
  viewId: string | null;
  widgetId: string;
  pageLayoutId: string;
};

export const useRecordTableSettingsDescriptions = ({
  objectMetadataId,
  viewId,
  widgetId,
  pageLayoutId,
}: UseRecordTableSettingsDescriptionsParams) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { view } = useRecordTableWidgetViewForDisplay({
    viewId: viewId ?? '',
    widgetId,
    pageLayoutId,
  });

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

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  const hasViewId = isDefined(viewId);

  const activeVisibleFieldLabels: Array<string | undefined> = hasViewId
    ? visibleRecordFields.map(
        (field) =>
          sourceObjectMetadataItem?.fields.find(
            (metaField) => metaField.id === field.fieldMetadataItemId,
          )?.label,
      )
    : [];

  const activeFilterLabels: Array<string | undefined> = (
    view?.viewFilters ?? []
  )
    .filter((filter) => !isCurrentRecordViewFilter(filter))
    .map(
      (filter) =>
        sourceObjectMetadataItem?.fields.find(
          (field) => field.id === filter.fieldMetadataId,
        )?.label,
    );

  const activeSortLabels: Array<string | undefined> = (
    view?.viewSorts ?? []
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
