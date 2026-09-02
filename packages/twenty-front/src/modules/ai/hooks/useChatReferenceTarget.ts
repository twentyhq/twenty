import { useLocation } from 'react-router-dom';
import { isNonEmptyString } from '@sniptt/guards';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatPath } from '~/utils/isAiChatPath';

export const useChatReferenceTarget = (
  path: string | undefined,
  onOpenArtifact?: () => void,
) => {
  const { pathname } = useLocation();
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const isArtifactSurface =
    isAiChatPath(pathname) && !shouldOpenAiChatAfterOnboarding;

  return {
    to: path,
    onClick:
      isNonEmptyString(path) && isArtifactSurface
        ? (onOpenArtifact ?? (() => openRoutedPageInSidePanel({ path })))
        : undefined,
  };
};
