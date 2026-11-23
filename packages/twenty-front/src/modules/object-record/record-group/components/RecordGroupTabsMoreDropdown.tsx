import { RecordGroupTabChip } from '@/object-record/record-group/components/RecordGroupTabChip';
import { RecordGroupTabCount } from '@/object-record/record-group/components/RecordGroupTabCount';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { Dropdown } from 'twenty-ui/components/navigation';

type RecordGroupTabsMoreDropdownProps = {
  dropdownId: string;
  hiddenRecordGroupTabIds: string[];
  activeRecordGroupTabId: string;
  onRecordGroupTabSelect: (recordGroupTabId: string) => void;
};

export const RecordGroupTabsMoreDropdown = ({
  dropdownId,
  hiddenRecordGroupTabIds,
  activeRecordGroupTabId,
  onRecordGroupTabSelect,
}: RecordGroupTabsMoreDropdownProps) => (
  <DropdownRoot dropdownId={dropdownId} type="picker">
    <TabMoreButton
      hiddenTabsCount={hiddenRecordGroupTabIds.length}
      active={hiddenRecordGroupTabIds.includes(activeRecordGroupTabId)}
      isDropdownTrigger
    />
    <DropdownContent align="end" sideOffset={8}>
      <Dropdown.Section>
        {hiddenRecordGroupTabIds.map((recordGroupTabId) => (
          <Dropdown.OptionItem
            key={recordGroupTabId}
            selected={recordGroupTabId === activeRecordGroupTabId}
            onSelect={() => onRecordGroupTabSelect(recordGroupTabId)}
            description={
              <RecordGroupTabCount recordGroupTabId={recordGroupTabId} />
            }
            descriptionPlacement="end"
          >
            <RecordGroupTabChip recordGroupTabId={recordGroupTabId} />
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </DropdownContent>
  </DropdownRoot>
);
