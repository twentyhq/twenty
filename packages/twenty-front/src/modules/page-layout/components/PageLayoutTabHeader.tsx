import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { PageLayoutType } from '~/generated/graphql';

export const PageLayoutTabHeader = () => {
  const { currentPageLayout } = useCurrentPageLayout();
  const targetRecordIdentifier = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const isMobile = useIsMobile();

  if (
    currentPageLayout?.type !== PageLayoutType.RECORD_PAGE ||
    !(isMobile || isInRightDrawer)
  ) {
    return null;
  }

  return (
    <SummaryCard
      objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
      objectRecordId={targetRecordIdentifier.id}
      isInRightDrawer={isInRightDrawer}
    />
  );
};
