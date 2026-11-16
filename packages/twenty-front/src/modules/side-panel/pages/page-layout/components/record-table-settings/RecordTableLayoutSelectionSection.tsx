import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutPickerOptions';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { WidgetVariantSelectionSection } from '@/side-panel/pages/page-layout/components/WidgetVariantSelectionSection';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type RecordTableLayoutSelectionSectionProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  currentLayoutViewType: RecordTableWidgetLayoutViewType;
};

export const RecordTableLayoutSelectionSection = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  currentLayoutViewType,
}: RecordTableLayoutSelectionSectionProps) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === objectMetadataId,
  );

  const { handleLayoutChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId,
  });

  const {
    layoutOptions,
    defaultGroupByFieldMetadataItem,
    defaultCalendarFieldMetadataItem,
  } = useRecordTableWidgetLayoutPickerOptions(objectMetadataItem);

  return (
    <WidgetVariantSelectionSection
      ariaLabel={t`Layout`}
      options={layoutOptions.map(
        ({ viewType, Icon, label, unavailableReason }) => ({
          variant: viewType,
          Icon,
          label: t(label),
          disabledReason: isDefined(unavailableReason)
            ? t(unavailableReason)
            : undefined,
        }),
      )}
      currentVariant={currentLayoutViewType}
      onSelect={(targetViewType) =>
        handleLayoutChange({
          targetViewType,
          defaultGroupByFieldMetadataItem,
          defaultCalendarFieldMetadataItem,
        })
      }
    />
  );
};
