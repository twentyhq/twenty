import { useStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenRecordsInSidePanel } from '@/side-panel/hooks/useOpenRecordsInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useChatTargetNavigation = () => {
  const store = useStore();
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openRecordsInSidePanel } = useOpenRecordsInSidePanel();

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
      openRecordsInSidePanel({
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
