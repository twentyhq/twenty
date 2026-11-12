import { RecordIndexTabChip } from '@/object-record/record-index-tab/components/RecordIndexTabChip';
import { RecordIndexTabCount } from '@/object-record/record-index-tab/components/RecordIndexTabCount';
import { type RecordIndexTabItem } from '@/object-record/record-index-tab/types/RecordIndexTabItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { Dropdown } from 'twenty-ui/components/navigation';

type RecordIndexTabsMoreDropdownProps = {
  dropdownId: string;
  hiddenRecordIndexTabItems: RecordIndexTabItem[];
  activeRecordIndexTabId: string;
  onRecordIndexTabSelect: (recordIndexTabId: string) => void;
};

export const RecordIndexTabsMoreDropdown = ({
  dropdownId,
  hiddenRecordIndexTabItems,
  activeRecordIndexTabId,
  onRecordIndexTabSelect,
}: RecordIndexTabsMoreDropdownProps) => (
  <DropdownRoot dropdownId={dropdownId} type="picker">
    <TabMoreButton
      hiddenTabsCount={hiddenRecordIndexTabItems.length}
      active={hiddenRecordIndexTabItems.some(
        ({ id }) => id === activeRecordIndexTabId,
      )}
      isDropdownTrigger
    />
    <DropdownContent align="end" sideOffset={8}>
      <Dropdown.Section>
        {hiddenRecordIndexTabItems.map((recordIndexTabItem) => (
          <Dropdown.OptionItem
            key={recordIndexTabItem.id}
            selected={recordIndexTabItem.id === activeRecordIndexTabId}
            onSelect={() => onRecordIndexTabSelect(recordIndexTabItem.id)}
            description={
              <RecordIndexTabCount recordIndexTabItem={recordIndexTabItem} />
            }
            descriptionPlacement="end"
          >
            <RecordIndexTabChip recordIndexTabItem={recordIndexTabItem} />
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </DropdownContent>
  </DropdownRoot>
);
