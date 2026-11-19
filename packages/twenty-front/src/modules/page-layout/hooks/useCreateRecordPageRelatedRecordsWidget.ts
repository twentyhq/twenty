import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultFieldWidget } from '@/page-layout/utils/createDefaultFieldWidget';
import { useFieldWidgetEligibleFields } from '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields';
import { getRelatedRecordsWidgetLayoutOptions } from '@/page-layout/widgets/field/utils/getRelatedRecordsWidgetLayoutOptions';
import { getRelatedRecordsWidgetSources } from '@/page-layout/widgets/field/utils/getRelatedRecordsWidgetSources';
import { isRelatedRecordsWidgetSourceAvailableForLayout } from '@/page-layout/widgets/field/utils/isRelatedRecordsWidgetSourceAvailableForLayout';
import { useAddDraftViewForFieldRelationTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForFieldRelationTableWidget';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { applyLayoutToRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/applyLayoutToRecordTableWidgetViewSnapshot';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

export const useCreateRecordPageRelatedRecordsWidget = ({
  objectNameSingular,
  pageLayoutId,
}: {
  objectNameSingular: string;
  pageLayoutId?: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();
  const fieldMetadataItems = useFieldWidgetEligibleFields(objectNameSingular);

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const { addDraftViewForFieldRelationTableWidget } =
    useAddDraftViewForFieldRelationTableWidget(pageLayoutId);

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const relatedRecordsWidgetSources = getRelatedRecordsWidgetSources({
    fieldMetadataItems,
    objectMetadataItems,
  });

  const relatedRecordsLayoutOptions = getRelatedRecordsWidgetLayoutOptions(
    relatedRecordsWidgetSources,
  );

  const createRecordPageRelatedRecordsWidget = ({
    tabId,
    positionIndex,
    layoutViewType,
  }: {
    tabId: string;
    positionIndex?: number;
    layoutViewType: RecordTableWidgetLayoutViewType;
  }) => {
    const pageLayoutDraft = store.get(pageLayoutDraftState);
    const existingWidgets =
      pageLayoutDraft.tabs.find((tab) => tab.id === tabId)?.widgets ?? [];

    const usedFieldMetadataIds = new Set(
      existingWidgets.flatMap((widget) =>
        widget.configuration.__typename === 'FieldConfiguration'
          ? [widget.configuration.fieldMetadataId]
          : [],
      ),
    );

    const availableSources = relatedRecordsWidgetSources.filter(
      (relatedRecordsWidgetSource) =>
        isRelatedRecordsWidgetSourceAvailableForLayout({
          relatedRecordsWidgetSource,
          layoutViewType,
        }),
    );

    const selectedSource =
      availableSources.find(
        ({ fieldMetadataItem }) =>
          !usedFieldMetadataIds.has(fieldMetadataItem.id),
      ) ?? availableSources[0];

    if (!isDefined(selectedSource)) {
      return undefined;
    }

    const widgetId = uuidv4();

    const viewId = addDraftViewForFieldRelationTableWidget({
      widgetId,
      targetObjectMetadataId: selectedSource.targetObjectMetadataItem.id,
      inverseFieldMetadataId: selectedSource.inverseFieldMetadataId,
      relationTargetFieldMetadataId:
        selectedSource.relationTargetFieldMetadataId,
    });

    if (!isDefined(viewId)) {
      return undefined;
    }

    store.set(recordTableWidgetViewDraftState, (previousDrafts) => ({
      ...previousDrafts,
      [widgetId]: applyLayoutToRecordTableWidgetViewSnapshot({
        widgetViewSnapshot: previousDrafts[widgetId],
        targetViewType: layoutViewType,
        defaultGroupByFieldMetadataItem:
          selectedSource.defaultGroupByFieldMetadataItem,
        defaultCalendarFieldMetadataItem:
          selectedSource.defaultCalendarFieldMetadataItem,
      }),
    }));

    const newWidget = createDefaultFieldWidget({
      id: widgetId,
      pageLayoutTabId: tabId,
      title: selectedSource.fieldMetadataItem.label,
      fieldMetadataId: selectedSource.fieldMetadataItem.id,
      fieldDisplayMode: FieldDisplayMode.TABLE,
      viewId,
      objectMetadataId: objectMetadataItem.id,
      positionIndex: positionIndex ?? existingWidgets.length,
    });

    store.set(pageLayoutDraftState, (previousDraft) => ({
      ...previousDraft,
      tabs: addWidgetToTab(previousDraft.tabs, tabId, newWidget),
    }));

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.RecordPageFieldSettings,
      focusTitleInput: true,
      resetNavigationStack: true,
    });
    store.set(pageLayoutEditingWidgetIdState, widgetId);

    return newWidget;
  };

  return { createRecordPageRelatedRecordsWidget, relatedRecordsLayoutOptions };
};
