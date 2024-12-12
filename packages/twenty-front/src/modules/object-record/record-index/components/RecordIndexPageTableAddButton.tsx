import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RecordIndexPageTableAddButtonInGroup } from '@/object-record/record-index/components/RecordIndexPageTableAddButtonInGroup';
import { RecordIndexPageTableAddButtonNoGroup } from '@/object-record/record-index/components/RecordIndexPageTableAddButtonNoGroup';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordIndexPageTableAddButton = () => {
  const hasRecordGroups = useRecoilComponentValueV2(
    hasRecordGroupsComponentSelector,
  );

  if (!hasRecordGroups) {
    return <RecordIndexPageTableAddButtonNoGroup />;
  }

  return <RecordIndexPageTableAddButtonInGroup />;
};
