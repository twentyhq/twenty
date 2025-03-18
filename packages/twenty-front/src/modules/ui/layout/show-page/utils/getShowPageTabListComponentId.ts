import { TAB_LIST_COMPONENT_ID } from '@/ui/layout/show-page/constants/ShowPageTabListComponentId';

export const getShowPageTabListComponentId = ({
  pageId,
  targetObjectId,
}: {
  pageId?: string;
  targetObjectId?: string;
}): string => {
  const id = pageId ?? targetObjectId;
  return `${TAB_LIST_COMPONENT_ID}-${id}`;
};
