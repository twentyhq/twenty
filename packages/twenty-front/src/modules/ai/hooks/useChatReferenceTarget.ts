import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { isAiChatArtifactSurface } from '@/ai/utils/isAiChatArtifactSurface';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';

export const useChatReferenceTarget = (path: string | undefined) => {
  const store = useStore();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

  return {
    to: path,
    onClick:
      isDefined(path) && isAiChatArtifactSurface(store)
        ? () => openRoutedPageInSidePanel({ path })
        : undefined,
  };
};
