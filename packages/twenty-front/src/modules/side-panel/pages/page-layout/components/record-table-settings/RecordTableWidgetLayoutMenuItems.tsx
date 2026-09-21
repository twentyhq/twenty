import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { type RecordTableWidgetLayoutPickerOption } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
            <ListItem
              disabled={isDisabled}
              focused={focusedItemId === viewType}
              onClick={() => onSelect(viewType)}
              role="option"
              aria-selected={selectedViewType === viewType}
              selected={selectedViewType === viewType}
              indicator="check"
              description={
                isDefined(unavailableReason) ? t(unavailableReason) : undefined
              }
              descriptionPlacement={'end'}
              startIcon={<SelectOptionIcon Icon={Icon} />}
            >
              <OverflowingTextWithTooltip text={t(label)} />
            </ListItem>
          </SelectableListItem>
        ),
      )}
    </>
  );
};
