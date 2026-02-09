import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { useBasePageLayout } from '@/page-layout/hooks/useBasePageLayout';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { injectRelationWidgetsIntoLayout } from '@/page-layout/utils/injectRelationWidgetsIntoLayout';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutRelationWidgetsSyncEffectProps = {
  pageLayoutId: string;
};

export const PageLayoutRelationWidgetsSyncEffect = ({
  pageLayoutId,
}: PageLayoutRelationWidgetsSyncEffectProps) => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const isInitialized = useRecoilComponentValue(
    pageLayoutIsInitializedComponentState,
  );

  const basePageLayout = useBasePageLayout(pageLayoutId);

  const { boxedRelationFieldMetadataItems } = useFieldListFieldMetadataItems({
    objectNameSingular: targetRecordIdentifier?.targetObjectNameSingular ?? '',
  });

  const pageLayoutPersistedComponentCallbackState =
    useRecoilComponentCallbackState(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
  );

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useRecoilComponentCallbackState(pageLayoutCurrentLayoutsComponentState);

  const syncPageLayoutWithRelationWidgets = useRecoilCallback(
    ({ set, snapshot }) =>
      (layout: PageLayout) => {
        const currentPersisted = getSnapshotValue(
          snapshot,
          pageLayoutPersistedComponentCallbackState,
        );

        if (!isDeeplyEqual(layout, currentPersisted)) {
          set(pageLayoutPersistedComponentCallbackState, layout);
          set(pageLayoutDraftComponentCallbackState, {
            id: layout.id,
            name: layout.name,
            type: layout.type,
            objectMetadataId: layout.objectMetadataId,
            tabs: layout.tabs,
          });

          const tabLayouts = convertPageLayoutToTabLayouts(layout);
          set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);
        }
      },
    [
      pageLayoutCurrentLayoutsComponentCallbackState,
      pageLayoutDraftComponentCallbackState,
      pageLayoutPersistedComponentCallbackState,
    ],
  );

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isDefined(basePageLayout)) {
      return;
    }

    const isRecordPage = layoutType === PageLayoutType.RECORD_PAGE;
    if (!isRecordPage) {
      return;
    }

    const layoutWithRelationWidgets = injectRelationWidgetsIntoLayout(
      basePageLayout,
      boxedRelationFieldMetadataItems,
    );

    syncPageLayoutWithRelationWidgets(layoutWithRelationWidgets);
  }, [
    basePageLayout,
    boxedRelationFieldMetadataItems,
    isInitialized,
    layoutType,
    syncPageLayoutWithRelationWidgets,
  ]);

  return null;
};
