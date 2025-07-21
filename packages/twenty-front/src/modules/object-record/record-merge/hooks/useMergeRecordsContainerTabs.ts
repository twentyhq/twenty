import { useMemo } from 'react';
import { IconArrowMerge, IconSettings } from 'twenty-ui/display';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { MergeRecordsTabId } from '../types/MergeRecordsTabId';
import {
  getPositionNumberIcon,
  getPositionWordLabel,
} from '../utils/recordMergeUtils';

export const useMergeRecordsContainerTabs = (
  selectedRecords: ObjectRecord[],
  loading: boolean,
): { tabs: SingleTabProps[] } => {
  const tabs = useMemo(() => {
    const mergePreviewTab: SingleTabProps = {
      id: MergeRecordsTabId.MERGE_PREVIEW,
      title: 'Merge preview',
      Icon: IconArrowMerge,
      hide: loading,
    };

    const recordTabs: SingleTabProps[] = selectedRecords.map(
      (record, index) => ({
        id: record.id,
        title: getPositionWordLabel(index),
        Icon: getPositionNumberIcon(index),
        hide: loading,
      }),
    );

    const settingsTab: SingleTabProps = {
      id: MergeRecordsTabId.SETTINGS,
      title: 'Settings',
      Icon: IconSettings,
      hide: loading,
    };

    return [mergePreviewTab, ...recordTabs, settingsTab];
  }, [selectedRecords, loading]);

  return { tabs };
};
