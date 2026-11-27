import { useCallback, useMemo } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isPageLayoutWidgetReadable } from '@/page-layout/utils/isPageLayoutWidgetReadable';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewSummariesSelector } from '@/views/states/selectors/viewSummariesSelector';
import { PageLayoutType } from '~/generated-metadata/graphql';

// TODO(@thomtrp): temporary, remove once conditional availability supports object read access
export const useIsPageLayoutWidgetReadable = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const viewSummaries = useAtomStateValue(viewSummariesSelector);
  const viewsByIdMap = useMemo(
    () =>
      new Map(
        viewSummaries.map((viewSummary) => [viewSummary.id, viewSummary]),
      ),
    [viewSummaries],
  );
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
