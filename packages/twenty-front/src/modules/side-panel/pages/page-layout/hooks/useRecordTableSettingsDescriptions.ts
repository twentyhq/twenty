import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { isCurrentRecordViewFilter } from '@/page-layout/widgets/record-table/utils/isCurrentRecordViewFilter';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

const PLACEHOLDER_INSTANCE_ID =
  'record-table-settings-descriptions-placeholder';

type UseRecordTableSettingsDescriptionsParams = {
  // The dashboard names its source object before the widget has a view
  sourceObjectMetadataId?: string | null;
  view: View | undefined;
};

export const useRecordTableSettingsDescriptions = ({
  sourceObjectMetadataId,
  view,
}: UseRecordTableSettingsDescriptionsParams) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === sourceObjectMetadataId,
  );
  const viewObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === view?.objectMetadataId,
  );

  const recordIndexId =
    isDefined(view) && isDefined(viewObjectMetadataItem)
      ? getRecordIndexIdFromObjectNamePluralAndViewId(
          viewObjectMetadataItem.namePlural,
          view.id,
        )
      : PLACEHOLDER_INSTANCE_ID;

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  const activeVisibleFieldLabels: Array<string | undefined> = isDefined(view)
    ? visibleRecordFields.map(
        (field) =>
          viewObjectMetadataItem?.fields.find(
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
        viewObjectMetadataItem?.fields.find(
          (field) => field.id === filter.fieldMetadataId,
        )?.label,
    );

  const activeSortLabels: Array<string | undefined> = (
    view?.viewSorts ?? []
  ).map(
    (sort) =>
      viewObjectMetadataItem?.fields.find(
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
