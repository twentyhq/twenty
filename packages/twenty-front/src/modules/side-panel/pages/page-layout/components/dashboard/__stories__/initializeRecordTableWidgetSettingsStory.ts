import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { RECORD_TABLE_WIDGET_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/dashboard/__stories__/recordTableWidgetSettingsStoryData';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  PageLayoutType,
  ViewType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';

export const initializeRecordTableWidgetSettingsStory = ({
  viewType = ViewType.TABLE_WIDGET,
  hasView = true,
}: {
  viewType?: RecordTableWidgetLayoutViewType;
  hasView?: boolean;
} = {}) => {
  const { pageLayoutId, widgetId, tabId, viewId } =
    RECORD_TABLE_WIDGET_SETTINGS_STORY_DATA;
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('opportunity');
  const snapshot = buildRecordTableWidgetViewSnapshot(objectMetadataItem);
  snapshot.view = { ...snapshot.view, id: viewId, type: viewType };
  const fieldNames = ['name', 'stage', 'amount', 'closeDate'];
  const fields = fieldNames.map((fieldName, position) => {
    const fieldMetadataItem = getMockFieldMetadataItemOrThrow({
      objectMetadataItem,
      fieldName,
    });
    return {
      id: `table-story-${fieldName}`,
      fieldMetadataId: fieldMetadataItem.id,
      viewId,
      position,
      isVisible: position < 3,
      isActive: true,
      size: 180,
    };
  });
  snapshot.viewFields = fields;
  jotaiStore.set(
    recordTableWidgetViewDraftComponentState.atomFamily({
      instanceId: pageLayoutId,
    }),
    hasView ? { [widgetId]: snapshot } : {},
  );
  jotaiStore.set(
    pageLayoutDraftComponentState.atomFamily({ instanceId: pageLayoutId }),
    {
      ...makeDraft([
        makeTab(tabId, [
          {
            ...makeWidget(widgetId, 0, tabId),
            type: WidgetType.RECORD_TABLE,
            objectMetadataId: objectMetadataItem.id,
            configuration: {
              __typename: 'RecordTableConfiguration',
              configurationType: WidgetConfigurationType.RECORD_TABLE,
              viewId: hasView ? viewId : undefined,
            },
          },
        ]),
      ]),
      type: PageLayoutType.DASHBOARD,
    },
  );
  jotaiStore.set(
    pageLayoutEditingWidgetIdComponentState.atomFamily({
      instanceId: pageLayoutId,
    }),
    widgetId,
  );
  jotaiStore.set(
    currentRecordFieldsComponentState.atomFamily({
      instanceId: getRecordIndexIdFromObjectNamePluralAndViewId(
        objectMetadataItem.namePlural,
        viewId,
      ),
    }),
    fields.map((field) => ({
      id: field.id,
      fieldMetadataItemId: field.fieldMetadataId,
      position: field.position,
      size: field.size,
      isVisible: field.isVisible,
    })),
  );
  jotaiStore.set(focusStackState.atom, [
    {
      focusId: SIDE_PANEL_FOCUS_ID,
      componentInstance: {
        componentType: FocusComponentType.SIDE_PANEL,
        componentInstanceId: SIDE_PANEL_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    },
  ]);
};
