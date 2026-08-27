import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { type LayoutRenderingContextType } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

type PageLayoutScrollWrapperArea = 'left-panel' | 'tab-content';

export const getScrollWrapperInstanceIdFromPageLayoutAndRecord = ({
  pageLayoutId,
  layoutType,
  targetRecordIdentifier,
  isInSidePanel,
  scrollWrapperArea,
  pageLayoutTabId,
}: {
  pageLayoutId: string;
  layoutType: LayoutRenderingContextType['layoutType'];
  targetRecordIdentifier?: TargetRecordIdentifier;
  isInSidePanel: boolean;
  scrollWrapperArea: PageLayoutScrollWrapperArea;
  pageLayoutTabId?: string;
}) => {
  const recordId =
    layoutType === PageLayoutType.RECORD_PAGE
      ? targetRecordIdentifier?.id
      : undefined;
  const recordScope = isDefined(recordId) ? `-${recordId}` : '';
  const renderingScope = isInSidePanel ? 'side-panel' : 'main-view';
  const tabScope = isDefined(pageLayoutTabId) ? `-${pageLayoutTabId}` : '';

  return `${getScrollWrapperInstanceIdFromPageLayoutId(
    pageLayoutId,
  )}${recordScope}-${renderingScope}-${scrollWrapperArea}${tabScope}`;
};
