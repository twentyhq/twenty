import { SidePanelPageLayoutInfoContent } from '@/side-panel/components/SidePanelPageLayoutInfoContent';
import { usePageLayoutIdFromContextStoreOrNull } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelPageLayoutInfo = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreOrNull();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return <SidePanelPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
