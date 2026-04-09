import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const useHasRecordTableWidgets = () => {
  const store = useStore();

  const hasRecordTableWidgets = useCallback(
    (pageLayoutId: string): boolean => {
      const pageLayoutDraft = store.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      return pageLayoutDraft.tabs.some((tab) =>
        tab.widgets.some(
          (widget) =>
            widget.configuration.configurationType ===
            WidgetConfigurationType.RECORD_TABLE,
        ),
      );
    },
    [store],
  );

  return { hasRecordTableWidgets };
};
