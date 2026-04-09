import { ObjectOptionsDropdownCalendarFieldsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownCalendarFieldsContent';
import { ObjectOptionsDropdownCalendarViewContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownCalendarViewContent';
import { ObjectOptionsDropdownFieldsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownFieldsContent';
import { ObjectOptionsDropdownHiddenFieldsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownHiddenFieldsContent';
import { ObjectOptionsDropdownHiddenRecordGroupsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownHiddenRecordGroupsContent';
import { ObjectOptionsDropdownLayoutContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownLayoutContent';
import { ObjectOptionsDropdownLayoutOpenInContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownLayoutOpenInContent';
import { ObjectOptionsDropdownMenuContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownMenuContent';
import { ObjectOptionsDropdownRecordGroupFieldsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownRecordGroupFieldsContent';
import { ObjectOptionsDropdownRecordGroupsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownRecordGroupsContent';
import { ObjectOptionsDropdownRecordGroupSortContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownRecordGroupSortContent';
import { ObjectOptionsDropdownVisibilityContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownVisibilityContent';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';

export const ObjectOptionsDropdownContent = () => {
  const { currentContentId } = useObjectOptionsDropdown();

  switch (currentContentId) {
    case 'layout':
      return <ObjectOptionsDropdownLayoutContent />;
    case 'layoutOpenIn':
      return <ObjectOptionsDropdownLayoutOpenInContent />;
    case 'fields':
      return <ObjectOptionsDropdownFieldsContent />;
    case 'hiddenFields':
      return <ObjectOptionsDropdownHiddenFieldsContent />;
    case 'recordGroups':
      return <ObjectOptionsDropdownRecordGroupsContent />;
    case 'recordGroupFields':
      return <ObjectOptionsDropdownRecordGroupFieldsContent />;
    case 'recordGroupSort':
      return <ObjectOptionsDropdownRecordGroupSortContent />;
    case 'hiddenRecordGroups':
      return <ObjectOptionsDropdownHiddenRecordGroupsContent />;
    case 'calendarView':
      return <ObjectOptionsDropdownCalendarViewContent />;
    case 'calendarFields':
      return <ObjectOptionsDropdownCalendarFieldsContent />;
    case 'visibility':
      return <ObjectOptionsDropdownVisibilityContent />;
    default:
      return <ObjectOptionsDropdownMenuContent />;
  }
};
