import { t } from '@lingui/core/macro';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutPickerOptions';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { isSelectableLayout } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { RecordTableWidgetLayoutMenuItems } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableWidgetLayoutMenuItems';

type RecordTableLayoutDropdownContentProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  currentLayoutViewType: RecordTableWidgetLayoutViewType;
};

export const RecordTableLayoutDropdownContent = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  currentLayoutViewType,
}: RecordTableLayoutDropdownContentProps) => {
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

  const handleSelectLayout = (
    targetViewType: RecordTableWidgetLayoutViewType,
  ) => {
    if (!isSelectableLayout(layoutOptions, targetViewType)) {
      return;
    }
    handleLayoutChange({
      targetViewType,
      defaultGroupByFieldMetadataItem,
      defaultCalendarFieldMetadataItem,
    });
  };

  return (
    <ChartSettingsDropdownSection>
      <Dropdown.SelectionGroup
        aria-label={t`Layout`}
        value={currentLayoutViewType}
      >
        <RecordTableWidgetLayoutMenuItems
          layoutOptions={layoutOptions}
          onSelect={handleSelectLayout}
        />
      </Dropdown.SelectionGroup>
    </ChartSettingsDropdownSection>
  );
};
