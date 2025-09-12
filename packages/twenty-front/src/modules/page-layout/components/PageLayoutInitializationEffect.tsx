import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { PageLayoutType } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import {
  pageLayoutCurrentLayoutsState,
  type TabLayouts,
} from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutPersistedState } from '../states/pageLayoutPersistedState';
import { savedPageLayoutsState } from '../states/savedPageLayoutsState';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

type PageLayoutInitializationEffectProps = {
  layoutId: string | undefined;
  isEditMode: boolean;
  pageLayout?: PageLayoutWithData;
};

export const PageLayoutInitializationEffect = ({
  layoutId,
  isEditMode,
  pageLayout,
}: PageLayoutInitializationEffectProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const savedPageLayouts = useRecoilValue(savedPageLayoutsState);

  const initializePageLayout = useRecoilCallback(
    ({ set, snapshot }) =>
      (layout: PageLayoutWithData | undefined) => {
        const currentPersisted = getSnapshotValue(
          snapshot,
          pageLayoutPersistedState,
        );

        if (isDefined(layout)) {
          if (!isDeeplyEqual(layout, currentPersisted)) {
            set(pageLayoutPersistedState, layout);
            set(pageLayoutDraftState, {
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
              set(pageLayoutCurrentLayoutsState, tabLayouts);
            } else {
              set(pageLayoutCurrentLayoutsState, {});
            }
          }
        } else {
          const defaultTab = {
            id: `tab-${uuidv4()}`,
            title: 'Main',
            position: 0,
            pageLayoutId: '',
            widgets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          };

          set(pageLayoutDraftState, {
            name: '',
            type: PageLayoutType.DASHBOARD,
            objectMetadataId: null,
            tabs: [defaultTab],
          });
          set(pageLayoutPersistedState, undefined);
          set(pageLayoutCurrentLayoutsState, {
            [defaultTab.id]: { desktop: [], mobile: [] },
          });
        }
      },
    [],
  );

  useEffect(() => {
    if (!isInitialized) {
      const existingLayout = isEditMode
        ? savedPageLayouts.find((l) => l.id === layoutId)
        : undefined;

      const layoutToInitialize = existingLayout || pageLayout;

      initializePageLayout(layoutToInitialize);
      setIsInitialized(true);
    }
  }, [
    layoutId,
    savedPageLayouts,
    initializePageLayout,
    isInitialized,
    isEditMode,
    pageLayout,
  ]);

  return null;
};
