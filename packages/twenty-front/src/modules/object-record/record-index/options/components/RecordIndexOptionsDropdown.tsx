import { RecordIndexOptionsDropdownButton } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdownButton';
import { RecordIndexOptionsDropdownContent } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdownContent';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useViewBar } from '@/views/hooks/useViewBar';

type RecordIndexOptionsDropdownProps = {
  objectNameSingular: string;
  recordIndexId: string;
};

export const RecordIndexOptionsDropdown = ({
  recordIndexId,
  objectNameSingular,
}: RecordIndexOptionsDropdownProps) => {
  const { setViewEditMode } = useViewBar();

  return (
    <Dropdown
      dropdownId={RECORD_INDEX_OPTIONS_DROPDOWN_ID}
      clickableComponent={<RecordIndexOptionsDropdownButton />}
      dropdownHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
      dropdownOffset={{ y: 8 }}
      dropdownComponents={
        <RecordIndexOptionsDropdownContent
          objectNameSingular={objectNameSingular}
          recordIndexId={recordIndexId}
        />
      }
      onClickOutside={() => setViewEditMode('none')}
    />
  );
};
