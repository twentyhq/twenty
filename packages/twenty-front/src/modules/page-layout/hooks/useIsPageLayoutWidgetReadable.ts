import { useCallback } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isPageLayoutWidgetReadable } from '@/page-layout/utils/isPageLayoutWidgetReadable';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const useIsPageLayoutWidgetReadable = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const isRecordPage = currentPageLayout.type === PageLayoutType.RECORD_PAGE;

  return useCallback(
    (widget: Pick<PageLayoutWidget, 'type' | 'objectMetadataId'>) =>
      !isRecordPage ||
      isPageLayoutWidgetReadable({
        widget,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
      }),
    [isRecordPage, objectMetadataItems, objectPermissionsByObjectMetadataId],
  );
};
