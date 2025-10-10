import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

export const useTargetRecord = () => {
  const { targetRecord } = useLayoutRenderingContext();

  if (!targetRecord) {
    throw new Error(
      'useTargetRecord must be used within a record page context (targetRecord is required)',
    );
  }

  return targetRecord;
};
