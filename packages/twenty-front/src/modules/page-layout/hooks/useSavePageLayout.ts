import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreatePendingFieldsWidgetViews } from '@/page-layout/hooks/useCreatePendingFieldsWidgetViews';
import { useCreatePendingRecordTableWidgetViews } from '@/page-layout/hooks/useCreatePendingRecordTableWidgetViews';
import { useUpdatePageLayoutWithTabsAndWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { findChartWidgetsMissingRequiredFields } from '@/page-layout/utils/findChartWidgetsMissingRequiredFields';
import { sanitizeChartFiltersInPageLayoutDraft } from '@/page-layout/utils/sanitizeChartFiltersInPageLayoutDraft';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

export const useSavePageLayout = (pageLayoutIdFromProps: string) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutPersistedCallbackState = useAtomComponentStateCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsCallbackState =
    useAtomComponentStateCallbackState(
      pageLayoutCurrentLayoutsComponentState,
      pageLayoutId,
    );

  const pageLayoutDraftCallbackState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const { updatePageLayoutWithTabsAndWidgets } =
    useUpdatePageLayoutWithTabsAndWidgets();

  const { createPendingFieldsWidgetViews } =
    useCreatePendingFieldsWidgetViews();

  const { createPendingRecordTableWidgetViews } =
    useCreatePendingRecordTableWidgetViews();

  const { objectMetadataItems } = useObjectMetadataItems();

  const store = useStore();

  const savePageLayout = useCallback(async () => {
    const [unfinishedChartWidget] = findChartWidgetsMissingRequiredFields(
      store.get(pageLayoutDraftCallbackState),
    );

    if (isDefined(unfinishedChartWidget)) {
      const widgetTitle = unfinishedChartWidget.title;

      enqueueToast({
        status: 'error',
        children: t`Finish configuring the chart "${widgetTitle}" before saving.`,
      });

      return {
        status: 'failed' as const,
        error: new Error(
          doNotTranslate('A chart widget is missing required fields'),
        ),
      };
    }

    await createPendingFieldsWidgetViews(pageLayoutId);
    await createPendingRecordTableWidgetViews(pageLayoutId);

    const pageLayoutDraft = store.get(pageLayoutDraftCallbackState);

    const sanitizedPageLayoutDraft = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft,
      fieldMetadataItemsByObjectMetadataId: new Map(
        objectMetadataItems.map((objectMetadataItem) => [
          objectMetadataItem.id,
          objectMetadataItem.fields,
        ]),
      ),
    });

    const updateInput = convertPageLayoutDraftToUpdateInput(
      sanitizedPageLayoutDraft,
    );

    const result = await updatePageLayoutWithTabsAndWidgets(
      pageLayoutId,
      updateInput,
    );

    if (result.status === 'successful') {
      const updatedPageLayout =
        result.response.data?.updatePageLayoutWithTabsAndWidgets;

      if (isDefined(updatedPageLayout)) {
        const persistedLayout: PageLayout =
          transformPageLayout(updatedPageLayout);

        store.set(pageLayoutPersistedCallbackState, persistedLayout);
        store.set(
          pageLayoutCurrentLayoutsCallbackState,
          convertPageLayoutToTabLayouts(persistedLayout),
        );
      }
    }

    return result;
  }, [
    createPendingFieldsWidgetViews,
    createPendingRecordTableWidgetViews,
    enqueueToast,
    objectMetadataItems,
    pageLayoutCurrentLayoutsCallbackState,
    pageLayoutDraftCallbackState,
    pageLayoutId,
    pageLayoutPersistedCallbackState,
    updatePageLayoutWithTabsAndWidgets,
    store,
    t,
  ]);

  return { savePageLayout };
};
