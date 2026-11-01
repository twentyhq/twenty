import { t } from '@lingui/core/macro';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import { useIcons } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';

type RecordTableCalendarFieldDropdownContentProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  currentCalendarFieldMetadataId: string | null;
};

export const RecordTableCalendarFieldDropdownContent = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  currentCalendarFieldMetadataId,
}: RecordTableCalendarFieldDropdownContentProps) => {
  const { getIcon } = useIcons();

  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === objectMetadataId,
  );

  const { handleCalendarFieldChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId,
  });

  const dateFields = (objectMetadataItem?.readableFields ?? []).filter(
    isFieldMetadataItemAvailableAsCalendarField,
  );

  return (
    <ChartSettingsDropdownSection>
      <Dropdown.SelectionGroup
        aria-label={t`Date field`}
        value={currentCalendarFieldMetadataId}
      >
        {dateFields.map((fieldMetadataItem) => (
          <Dropdown.OptionItem
            key={fieldMetadataItem.id}
            value={fieldMetadataItem.id}
            onSelect={() => handleCalendarFieldChange(fieldMetadataItem)}
            startIcon={
              <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
            }
          >
            {fieldMetadataItem.label}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </ChartSettingsDropdownSection>
  );
};
