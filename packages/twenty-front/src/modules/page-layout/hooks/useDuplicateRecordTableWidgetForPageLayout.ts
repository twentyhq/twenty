import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { buildRecordTableWidgetViewSnapshotFromView } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshotFromView';
import { cloneRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/cloneRecordTableWidgetViewSnapshot';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

type DuplicateRecordTableWidgetParams = {
  sourceWidget: PageLayoutWidget;
  newWidgetId: string;
};

type DuplicateRecordTableWidgetResult = {
  newViewId: string;
};

export const useDuplicateRecordTableWidgetForPageLayout = ({
  pageLayoutId,
}: {
  pageLayoutId: string;
}) => {
  const store = useStore();

  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const duplicateRecordTableWidget = useCallback(
    ({
      sourceWidget,
      newWidgetId,
    }: DuplicateRecordTableWidgetParams): DuplicateRecordTableWidgetResult | null => {
      if (sourceWidget.type !== WidgetType.RECORD_TABLE) {
        return null;
      }

      const sourceSnapshotFromDraft = store.get(
        recordTableWidgetViewDraftState,
      )[sourceWidget.id];

      const sourceViewId = getWidgetConfigurationViewId(
        sourceWidget.configuration,
      );

      const sourceViewFromMetadataStore =
        !isDefined(sourceSnapshotFromDraft) && isDefined(sourceViewId)
          ? store.get(
              viewFromViewIdFamilySelector.selectorFamily({
                viewId: sourceViewId,
              }),
            )
          : undefined;

      const sourceSnapshotFromMetadataStore = isDefined(
        sourceViewFromMetadataStore,
      )
        ? buildRecordTableWidgetViewSnapshotFromView(
            sourceViewFromMetadataStore,
          )
        : undefined;

      const snapshotToClone =
        sourceSnapshotFromDraft ?? sourceSnapshotFromMetadataStore;

      if (!isDefined(snapshotToClone)) {
        return null;
      }

      const clonedSnapshot =
        cloneRecordTableWidgetViewSnapshot(snapshotToClone);

      store.set(recordTableWidgetViewDraftState, (previousDraft) => ({
        ...previousDraft,
        [newWidgetId]: clonedSnapshot,
      }));

      return { newViewId: clonedSnapshot.view.id };
    },
    [recordTableWidgetViewDraftState, store],
  );

  return { duplicateRecordTableWidget };
};
