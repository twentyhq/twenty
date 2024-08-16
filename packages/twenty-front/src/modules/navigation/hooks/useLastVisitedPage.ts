import { lastVisitedPageOrViewStateSelector } from '@/navigation/states/selectors/lastVisitedPageOrViewStateSelector';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilValue } from 'recoil';

export const useLastVisitedPage = (scopeId: string) => {
  const currentPagesState = extractComponentState(
    lastVisitedPageOrViewStateSelector,
    scopeId,
  );

  const currentPages = useRecoilValue(currentPagesState);
  const lastVisitedObjectMetadataId = currentPages?.['default'] ?? null;

  return {
    lastVisitedObjectMetadataId,
  };
};
