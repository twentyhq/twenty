import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useDeletePageLayoutTab } from '@/page-layout/hooks/useDeletePageLayoutTab';
import { useDuplicatePageLayoutTab } from '@/page-layout/hooks/useDuplicatePageLayoutTab';
import { useRenamePageLayoutTab } from '@/page-layout/hooks/useRenamePageLayoutTab';
import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

type PageLayoutTabListProps = {
  pageLayoutId: string;
  isInEditMode: boolean;
};

export const PageLayoutTabList = ({
  pageLayoutId,
  isInEditMode,
}: PageLayoutTabListProps) => {
  const { currentPageLayout } = useCurrentPageLayout();

  const { createPageLayoutTab } = useCreatePageLayoutTab(pageLayoutId);
  const { handleReorderTabs } = useReorderPageLayoutTabs(pageLayoutId);
  const { renamePageLayoutTab } = useRenamePageLayoutTab(pageLayoutId);
  const { duplicatePageLayoutTab } = useDuplicatePageLayoutTab(pageLayoutId);
  const { deletePageLayoutTab } = useDeletePageLayoutTab(pageLayoutId);

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const handleAddTab = isInEditMode ? createPageLayoutTab : undefined;

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  const sortedTabs = [...currentPageLayout.tabs].sort(
    (a, b) => a.position - b.position,
  );

  const tabActions = isInEditMode
    ? {
        onRename: renamePageLayoutTab,
        onDuplicate: duplicatePageLayoutTab,
        onDelete: deletePageLayoutTab,
      }
    : undefined;

  return (
    <StyledTabList
      tabs={sortedTabs}
      behaveAsLinks={false}
      componentInstanceId={tabListInstanceId}
      onAddTab={handleAddTab}
      isDraggable={isInEditMode}
      onDragEnd={isInEditMode ? handleReorderTabs : undefined}
      tabActions={tabActions}
    />
  );
};
