import { SidePanelPageLayoutInfoContent } from '@/side-panel/components/SidePanelPageLayoutInfoContent';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelPageLayoutInfo = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return <SidePanelPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
