import { FIND_ONE_PAGE_LAYOUT } from '@/dashboards/graphql/queries/findOnePageLayout';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutInitializationQueryEffectProps = {
  pageLayoutId: string;
  onInitialized: (pageLayout: PageLayout) => void;
};

export const PageLayoutInitializationQueryEffect = ({
  pageLayoutId,
  onInitialized,
}: PageLayoutInitializationQueryEffectProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const { data } = useQuery(FIND_ONE_PAGE_LAYOUT, {
    variables: {
      id: pageLayoutId,
    },
  });

  const pageLayout: PageLayout | undefined = data?.getPageLayout
    ? transformPageLayout(data.getPageLayout)
    : undefined;

  const pageLayoutPersistedComponentCallbackState =
    useRecoilComponentCallbackState(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
  );

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useRecoilComponentCallbackState(pageLayoutCurrentLayoutsComponentState);

  const initializePageLayout = useRecoilCallback(
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
    if (!isInitialized && isDefined(pageLayout)) {
      initializePageLayout(pageLayout);
      onInitialized?.(pageLayout);
      setIsInitialized(true);
    }
  }, [initializePageLayout, isInitialized, pageLayout, onInitialized]);

  return null;
};
