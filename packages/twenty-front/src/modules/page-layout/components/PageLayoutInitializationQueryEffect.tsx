import { FIND_ONE_PAGE_LAYOUT } from '@/dashboards/graphql/queries/findOnePageLayout';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayoutWithData } from '@/page-layout/types/pageLayoutTypes';
import { type TabLayouts } from '@/page-layout/types/tab-layouts';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutInitializationQueryEffectProps = {
  pageLayoutId: string;
};

export const PageLayoutInitializationQueryEffect = ({
  pageLayoutId,
}: PageLayoutInitializationQueryEffectProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const { data } = useQuery(FIND_ONE_PAGE_LAYOUT, {
    variables: {
      id: pageLayoutId,
    },
  });

  const pageLayout: PageLayoutWithData | undefined = data?.getPageLayout;

  const pageLayoutPersistedComponentCallbackState =
    useRecoilComponentCallbackState(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
  );

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useRecoilComponentCallbackState(pageLayoutCurrentLayoutsComponentState);

  const initializePageLayout = useRecoilCallback(
    ({ set, snapshot }) =>
      (layout: PageLayoutWithData) => {
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

          if (layout.tabs.length > 0) {
            const tabLayouts: TabLayouts = {};
            layout.tabs.forEach((tab) => {
              const layouts = tab.widgets.map((w) => ({
                i: w.id,
                x: w.gridPosition.column,
                y: w.gridPosition.row,
                w: w.gridPosition.columnSpan,
                h: w.gridPosition.rowSpan,
              }));
              tabLayouts[tab.id] = {
                desktop: layouts,
                mobile: layouts.map((l) => ({ ...l, w: 1, x: 0 })),
              };
            });
            set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);
          } else {
            set(pageLayoutCurrentLayoutsComponentCallbackState, {});
          }
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
      setIsInitialized(true);
    }
  }, [initializePageLayout, isInitialized, pageLayout]);

  return null;
};
