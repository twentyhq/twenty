import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  return (
    <>
      <StyledTabList
        tabs={currentPageLayout.tabs}
        behaveAsLinks={false}
        componentInstanceId={getTabListInstanceIdFromPageLayoutId(
          currentPageLayout.id,
        )}
      />
      <PageLayoutGridLayout />
    </>
  );
};
