import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';
import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Tabs } from 'twenty-ui/primitives/navigation';

export const RecordGroupAllTab = () => {
  const { t } = useLingui();

  const { totalCount } = useGetRecordIndexTotalCount();

  return (
    <Tabs.Tab
      variant="filled"
      value={ALL_RECORD_GROUPS_TAB_ID}
      badge={isDefined(totalCount) ? totalCount : '-'}
    >
      <Tag
        variant="outline"
        borderStyle="dashed"
        color="transparent"
        weight="medium"
      >
        {t`All`}
      </Tag>
    </Tabs.Tab>
  );
};
