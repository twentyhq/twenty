import { RecordGroupAllCount } from '@/object-record/record-group/components/RecordGroupAllCount';
import { RecordGroupCount } from '@/object-record/record-group/components/RecordGroupCount';
import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';

type RecordGroupTabCountProps = {
  recordGroupTabId: string;
};

export const RecordGroupTabCount = ({
  recordGroupTabId,
}: RecordGroupTabCountProps) =>
  recordGroupTabId === ALL_RECORD_GROUPS_TAB_ID ? (
    <RecordGroupAllCount />
  ) : (
    <RecordGroupCount recordGroupId={recordGroupTabId} />
  );
