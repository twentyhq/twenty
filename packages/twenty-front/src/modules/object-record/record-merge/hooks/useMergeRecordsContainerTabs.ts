import { useMemo } from 'react';

import { useLingui } from '@lingui/react/macro';

import { IconArrowMerge, IconSettings } from 'twenty-ui/display';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { MergeRecordsTabId } from '../types/MergeRecordsTabId';
import { getPositionNumberIcon } from '../utils/getPositionNumberIcon';
import { getPositionWordLabel } from '../utils/getPositionWordLabel';

export const useMergeRecordsContainerTabs = (
  selectedRecords: ObjectRecord[],
): { tabs: SingleTabProps[] } => {
  const { t } = useLingui();

  const tabs = useMemo(() => {
    const mergePreviewTab: SingleTabProps = {
      id: MergeRecordsTabId.MERGE_PREVIEW,
      title: t`Merge preview`,
      Icon: IconArrowMerge,
    };

    const recordTabs: SingleTabProps[] = selectedRecords.map(
      (record, index) => ({
        id: record.id,
        title: getPositionWordLabel(index),
        Icon: getPositionNumberIcon(index),
      }),
    );

    const settingsTab: SingleTabProps = {
      id: MergeRecordsTabId.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
    };

    return [mergePreviewTab, ...recordTabs, settingsTab];
  }, [t, selectedRecords]);

  return { tabs };
};
