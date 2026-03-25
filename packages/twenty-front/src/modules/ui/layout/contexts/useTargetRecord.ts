import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

export const useTargetRecord = () => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  if (!targetRecordIdentifier) {
    throw new Error(
      'useTargetRecord must be used within a record page context (targetRecordIdentifier is required)',
    );
  }

  return targetRecordIdentifier;
};
