import { AppPath } from 'twenty-shared/types';

import { useIsAiChatArtifactSurface } from '@/ai/hooks/useIsAiChatArtifactSurface';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useChatTargetNavigation = () => {
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const isAiChatArtifactSurface = useIsAiChatArtifactSurface();

  const openRecordTarget = ({
    recordId,
    objectNameSingular,
  }: {
    recordId: string;
    objectNameSingular: string;
  }) => {
    if (isAiChatArtifactSurface) {
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

  return { openRecordTarget };
};
