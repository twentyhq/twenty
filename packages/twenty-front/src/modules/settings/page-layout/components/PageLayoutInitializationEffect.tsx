import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { type Widget } from '../mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutPersistedState } from '../states/pageLayoutPersistedState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import {
  savedPageLayoutsState,
  type SavedPageLayout,
} from '../states/savedPageLayoutsState';

type PageLayoutInitializationEffectProps = {
  layoutId: string | undefined;
  isEditMode: boolean;
};

export const PageLayoutInitializationEffect = ({
  layoutId,
  isEditMode,
}: PageLayoutInitializationEffectProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const savedPageLayouts = useRecoilValue(savedPageLayoutsState);

  const initializePageLayout = useRecoilCallback(
    ({ set, snapshot }) =>
      (layout: SavedPageLayout | undefined) => {
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
              widgets: layout.widgets,
            });

            const widgets: Widget[] = layout.widgets.map((w) => ({
              id: w.id,
              title: w.title,
              type: w.type,
              graphType: w.graphType,
              data: w.data,
            }));
            set(pageLayoutWidgetsState, widgets);

            const layouts = layout.widgets.map((w) => ({
              i: w.id,
              x: w.gridPosition.column,
              y: w.gridPosition.row,
              w: w.gridPosition.columnSpan,
              h: w.gridPosition.rowSpan,
            }));
            set(pageLayoutCurrentLayoutsState, {
              desktop: layouts,
              mobile: layouts.map((l) => ({ ...l, w: 1, x: 0 })),
            });
          }
        } else {
          set(pageLayoutDraftState, {
            name: '',
            type: 'DASHBOARD',
            widgets: [],
          });
          set(pageLayoutPersistedState, undefined);
          set(pageLayoutWidgetsState, []);
          set(pageLayoutCurrentLayoutsState, { desktop: [], mobile: [] });
        }
      },
    [],
  );

  useEffect(() => {
    if (!isInitialized) {
      const existingLayout = isEditMode
        ? savedPageLayouts.find((l) => l.id === layoutId)
        : undefined;
      initializePageLayout(existingLayout);
      setIsInitialized(true);
    }
  }, [
    layoutId,
    savedPageLayouts,
    initializePageLayout,
    isInitialized,
    isEditMode,
  ]);

  return null;
};
