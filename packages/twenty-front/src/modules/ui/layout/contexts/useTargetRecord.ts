import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

export const useTargetRecord = () => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  if (!targetRecordIdentifier) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This missing component state is a developer invariant diagnostic.
      'useTargetRecord must be used within a record page context (targetRecordIdentifier is required)',
    );
  }

  return targetRecordIdentifier;
};
