import { RecordGroupTabChip } from '@/object-record/record-group/components/RecordGroupTabChip';
import { RecordGroupTabCount } from '@/object-record/record-group/components/RecordGroupTabCount';
import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';
import { Tabs } from 'twenty-ui/primitives/navigation';

export const RecordGroupAllTab = () => (
  <Tabs.Tab
    variant="filled"
    value={ALL_RECORD_GROUPS_TAB_ID}
    badge={<RecordGroupTabCount recordGroupTabId={ALL_RECORD_GROUPS_TAB_ID} />}
  >
    <RecordGroupTabChip recordGroupTabId={ALL_RECORD_GROUPS_TAB_ID} />
  </Tabs.Tab>
);
