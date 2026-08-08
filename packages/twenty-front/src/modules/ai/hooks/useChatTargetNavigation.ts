import { useStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getObjectMetadataItemBySingularNameOrThrow } from '@/object-metadata/utils/getObjectMetadataItemBySingularNameOrThrow';
import { useOpenRecordIndexInSidePanel } from '@/side-panel/hooks/useOpenRecordIndexInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

// The single place deciding where a target surfaced from the chat lands.
// On the chat page the conversation keeps the main pane and targets open in
// the side panel as artifacts; everywhere else they navigate the workspace.
export const useChatTargetNavigation = () => {
  const store = useStore();
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openRecordIndexInSidePanel } = useOpenRecordIndexInSidePanel();

  const openRecordTarget = ({
    recordId,
    objectNameSingular,
  }: {
    recordId: string;
    objectNameSingular: string;
  }) => {
    if (isCurrentPathAiChatPage()) {
      openRecordInSidePanel({
        recordId,
        objectNameSingular,
      });

      return;
    }

    navigateApp(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: recordId,
    });
  };

  const openViewTarget = ({
    objectNameSingular,
    viewId,
  }: {
    objectNameSingular: string;
    viewId?: string;
  }) => {
    if (isCurrentPathAiChatPage()) {
      openRecordIndexInSidePanel({
        objectNameSingular,
        viewId,
      });

      return;
    }

    const objectMetadataItem = getObjectMetadataItemBySingularNameOrThrow(
      store,
      objectNameSingular,
    );

    navigateApp(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadataItem.namePlural },
      isDefined(viewId) ? { viewId } : undefined,
    );
  };

  return { openRecordTarget, openViewTarget };
};
