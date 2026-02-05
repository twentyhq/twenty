import { contextStoreCurrentPageLayoutIdComponentState } from '@/context-store/states/contextStoreCurrentPageLayoutIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordPageLayoutIdFromRecordStoreOrThrow = () => {
  const pageLayoutId = useRecoilComponentValue(
    contextStoreCurrentPageLayoutIdComponentState,
  );

  if (!isDefined(pageLayoutId)) {
    throw new Error('Page layout id not found in context store');
  }

  return {
    pageLayoutId,
  };
};
