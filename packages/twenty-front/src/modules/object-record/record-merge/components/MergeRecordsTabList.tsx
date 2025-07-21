import styled from '@emotion/styled';
import { IconArrowMerge, IconSettings } from 'twenty-ui/display';

import { MergeRecordsTabId } from '@/object-record/record-merge/types/MergeRecordsTabId';
import {
  getPositionNumberIcon,
  getPositionWordLabel,
} from '@/object-record/record-merge/utils/recordMergeUtils';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { TabList } from '@/ui/layout/tab-list/components/TabList';

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

type MergeRecordsTabListProps = {
  selectedRecords: ObjectRecord[];
  loading?: boolean;
  componentInstanceId: string;
};

export const MergeRecordsTabList = ({
  selectedRecords,
  componentInstanceId,
}: MergeRecordsTabListProps) => {
  const tabs = [
    {
      id: MergeRecordsTabId.MERGE_PREVIEW,
      title: 'Merge preview',
      Icon: IconArrowMerge,
    },
    ...selectedRecords.map((record, index) => ({
      id: record.id,
      title: getPositionWordLabel(index),
      Icon: () => {
        const IconComponent = getPositionNumberIcon(index);
        return IconComponent ? <IconComponent size={16} /> : null;
      },
    })),
    {
      id: MergeRecordsTabId.SETTINGS,
      title: 'Settings',
      Icon: IconSettings,
    },
  ];

  return (
    <StyledTabList
      tabs={tabs}
      behaveAsLinks={false}
      componentInstanceId={componentInstanceId}
    />
  );
};
