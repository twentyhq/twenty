import { AppPath } from 'twenty-shared/types';

import { useIsInboxArtifactSurface } from '@/ai/hooks/useIsInboxArtifactSurface';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useChatTargetNavigation = () => {
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const isInboxArtifactSurface = useIsInboxArtifactSurface();

  const openRecordTarget = ({
    recordId,
    objectNameSingular,
  }: {
    recordId: string;
    objectNameSingular: string;
  }) => {
    if (isInboxArtifactSurface) {
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
