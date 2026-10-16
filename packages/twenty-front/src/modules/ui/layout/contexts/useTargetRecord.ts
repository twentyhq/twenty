import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useTargetRecord = () => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  if (!targetRecordIdentifier) {
    throw new Error(
      doNotTranslate(
        'useTargetRecord must be used within a record page context (targetRecordIdentifier is required)',
      ),
    );
  }

  return targetRecordIdentifier;
};
