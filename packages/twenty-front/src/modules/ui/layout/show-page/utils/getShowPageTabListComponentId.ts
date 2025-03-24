import { SHOW_PAGE_RIGHT_TAB_LIST } from '@/ui/layout/show-page/constants/ShowPageTabListComponentId';

export const getShowPageTabListComponentId = ({
  pageId,
  targetObjectId,
}: {
  pageId?: string;
  targetObjectId: string;
}): string => {
  const id = pageId || targetObjectId;
  return `${SHOW_PAGE_RIGHT_TAB_LIST}-${id}`;
};
