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
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutRelationWidgetsSyncEffectProps = {
  pageLayoutId: string;
};

export const PageLayoutRelationWidgetsSyncEffect = ({
  pageLayoutId,
}: PageLayoutRelationWidgetsSyncEffectProps) => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const isInitialized = useRecoilComponentValueV2(
    pageLayoutIsInitializedComponentState,
  );

  const basePageLayout = useBasePageLayout(pageLayoutId);

  const { boxedRelationFieldMetadataItems } = useFieldListFieldMetadataItems({
    objectNameSingular: targetRecordIdentifier?.targetObjectNameSingular ?? '',
  });

  const pageLayoutPersistedComponentCallbackState =
    useRecoilComponentStateCallbackStateV2(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState =
    useRecoilComponentStateCallbackStateV2(pageLayoutDraftComponentState);

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useRecoilComponentStateCallbackStateV2(
      pageLayoutCurrentLayoutsComponentState,
    );

  const store = useStore();

  const syncPageLayoutWithRelationWidgets = useCallback(
    (layout: PageLayout) => {
      const currentPersisted = store.get(
        pageLayoutPersistedComponentCallbackState,
      );

      if (!isDeeplyEqual(layout, currentPersisted)) {
        store.set(pageLayoutPersistedComponentCallbackState, layout);
        store.set(pageLayoutDraftComponentCallbackState, {
          id: layout.id,
          name: layout.name,
          type: layout.type,
          objectMetadataId: layout.objectMetadataId,
          tabs: layout.tabs,
        });

        const tabLayouts = convertPageLayoutToTabLayouts(layout);
        store.set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);
      }
    },
    [
      pageLayoutCurrentLayoutsComponentCallbackState,
      pageLayoutDraftComponentCallbackState,
      pageLayoutPersistedComponentCallbackState,
      store,
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
