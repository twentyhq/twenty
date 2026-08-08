import { useStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenRecordIndexInSidePanel } from '@/side-panel/hooks/useOpenRecordIndexInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

// The single place deciding where a target surfaced from the chat lands.
// On the chat page the conversation keeps the main pane and targets open in
// the side panel as artifacts; everywhere else they navigate the workspace.
// The onboarding conversation is the exception: its purpose is to build the
// workspace and hand the user over to it, so its targets navigate — the
// chat then continues in the side panel through the handoff.
export const useChatTargetNavigation = () => {
  const store = useStore();
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openRecordIndexInSidePanel } = useOpenRecordIndexInSidePanel();

  const isArtifactSurface = () =>
    isCurrentPathAiChatPage() &&
    !store.get(shouldOpenAiChatAfterOnboardingState.atom);

  const openRecordTarget = ({
    recordId,
    objectNameSingular,
  }: {
    recordId: string;
    objectNameSingular: string;
  }) => {
    if (isArtifactSurface()) {
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
    if (isArtifactSurface()) {
      openRecordIndexInSidePanel({
        objectNameSingular,
        viewId,
      });

      return;
    }

    const objectMetadataItem = store.get(
      objectMetadataItemFamilySelector.selectorFamily({
        objectName: objectNameSingular,
        objectNameType: 'singular',
      }),
    );

    if (!isDefined(objectMetadataItem)) {
      throw new Error(
        `Object with singular name ${objectNameSingular} not found.`,
      );
    }

    navigateApp(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadataItem.namePlural },
      isDefined(viewId) ? { viewId } : undefined,
    );
  };

  return { openRecordTarget, openViewTarget };
};
