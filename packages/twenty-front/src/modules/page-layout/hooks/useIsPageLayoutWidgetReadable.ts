import { useCallback } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isPageLayoutWidgetReadable } from '@/page-layout/utils/isPageLayoutWidgetReadable';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsByIdMapSelector } from '@/views/states/selectors/viewsByIdMapSelector';
import { PageLayoutType } from '~/generated-metadata/graphql';

// TODO(@thomtrp): temporary, remove once conditional availability supports object read access
export const useIsPageLayoutWidgetReadable = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const viewsByIdMap = useAtomStateValue(viewsByIdMapSelector);
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const shouldHideUnreadableWidgets =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE &&
    !isPageLayoutInEditMode;

  return useCallback(
    (
      widget: Pick<
        PageLayoutWidget,
        'type' | 'objectMetadataId' | 'configuration'
      >,
    ) =>
      !shouldHideUnreadableWidgets ||
      isPageLayoutWidgetReadable({
        widget,
        pageObjectMetadataId: currentPageLayout.objectMetadataId,
        objectMetadataItems,
        viewsByIdMap,
        objectPermissionsByObjectMetadataId,
      }),
    [
      shouldHideUnreadableWidgets,
      currentPageLayout.objectMetadataId,
      objectMetadataItems,
      viewsByIdMap,
      objectPermissionsByObjectMetadataId,
    ],
  );
};
