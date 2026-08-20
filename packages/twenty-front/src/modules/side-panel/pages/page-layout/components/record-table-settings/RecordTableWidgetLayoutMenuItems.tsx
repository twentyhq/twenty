import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { type RecordTableWidgetLayoutPickerOption } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';

type RecordTableWidgetLayoutMenuItemsProps = {
  layoutOptions: RecordTableWidgetLayoutPickerOption[];
  // Undefined when the host widget is not currently showing an embedded view,
  // so no layout reads as selected.
  selectedViewType: RecordTableWidgetLayoutViewType | undefined;
  focusedItemId: string | null;
  onSelect: (viewType: RecordTableWidgetLayoutViewType) => void;
};

export const RecordTableWidgetLayoutMenuItems = ({
  layoutOptions,
  selectedViewType,
  focusedItemId,
  onSelect,
}: RecordTableWidgetLayoutMenuItemsProps) => {
  const { t } = useLingui();

  return (
    <>
      {layoutOptions.map(
        ({ viewType, Icon, label, isDisabled, unavailableReason }) => (
          <SelectableListItem
            key={viewType}
            itemId={viewType}
            onEnter={() => onSelect(viewType)}
          >
            <MenuItemSelect
              text={t(label)}
              LeftIcon={Icon}
              disabled={isDisabled}
              contextualText={
                isDefined(unavailableReason) ? t(unavailableReason) : undefined
              }
              contextualTextPosition="right"
              selected={selectedViewType === viewType}
              focused={focusedItemId === viewType}
              onClick={() => onSelect(viewType)}
            />
          </SelectableListItem>
        ),
      )}
    </>
  );
};
