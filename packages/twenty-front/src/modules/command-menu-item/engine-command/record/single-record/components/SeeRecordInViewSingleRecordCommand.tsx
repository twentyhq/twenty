import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { recordViewsTargetComponentState } from '@/side-panel/pages/record-views/states/recordViewsTargetComponentState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const SeeRecordInViewSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();
  const { navigateSidePanel } = useNavigateSidePanel();
  const store = useStore();

  const handleExecute = () => {
    const record = selectedRecords[0];

    if (!isDefined(record) || !isDefined(objectMetadataItem)) {
      return;
    }

    const pageId = v4();

    store.set(
      recordViewsTargetComponentState.atomFamily({ instanceId: pageId }),
      {
        objectNameSingular: objectMetadataItem.nameSingular,
        recordId: record.id,
      },
    );
    navigateSidePanel({
      page: SidePanelPages.RecordViews,
      pageTitle: t`See in view…`,
      pageIcon: IconArrowUpRight,
      pageId,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
