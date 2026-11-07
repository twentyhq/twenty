import { getChartSettingsStoryConfiguration } from '@/side-panel/pages/page-layout/components/__stories__/getChartSettingsStoryConfiguration';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { CHART_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/__stories__/chartSettingsStoryData';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { WidgetType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';

export const initializeChartSettingsStory = ({
  chartType = 'bar',
  objectName = 'opportunity',
}: {
  chartType?: 'bar' | 'aggregate';
  objectName?: string;
} = {}) => {
  const { pageLayoutId, widgetId, tabId } = CHART_SETTINGS_STORY_DATA;
  const objectMetadataItem = getMockObjectMetadataItemOrThrow(objectName);
  const groupField = getMockFieldMetadataItemOrThrow({
    objectMetadataItem,
    fieldName: objectName === 'opportunity' ? 'stage' : 'name',
  });
  const aggregateField = getMockFieldMetadataItemOrThrow({
    objectMetadataItem,
    fieldName: objectName === 'opportunity' ? 'amount' : 'employees',
  });
  const configuration = getChartSettingsStoryConfiguration({
    chartType,
    groupFieldMetadataId: groupField.id,
    aggregateFieldMetadataId: aggregateField.id,
  });
  jotaiStore.set(
    pageLayoutDraftComponentState.atomFamily({ instanceId: pageLayoutId }),
    makeDraft([
      makeTab(tabId, [
        {
          ...makeWidget(widgetId, 0, tabId),
          type: WidgetType.GRAPH,
          objectMetadataId: objectMetadataItem.id,
          configuration,
        },
      ]),
    ]),
  );
  jotaiStore.set(
    pageLayoutEditingWidgetIdComponentState.atomFamily({
      instanceId: pageLayoutId,
    }),
    widgetId,
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
