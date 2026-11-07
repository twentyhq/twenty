import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { FIELD_WIDGET_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/record-page/__stories__/fieldWidgetSettingsStoryData';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FieldDisplayMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

export const initializeFieldWidgetSettingsStory = ({
  fieldName = 'name',
  fieldDisplayMode = FieldDisplayMode.FIELD,
}: {
  fieldName?: string;
  fieldDisplayMode?: FieldDisplayMode;
} = {}) => {
  const { pageLayoutId, widgetId, tabId } = FIELD_WIDGET_SETTINGS_STORY_DATA;
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');
  const fieldMetadataItem = getMockFieldMetadataItemOrThrow({
    objectMetadataItem,
    fieldName,
  });

  jotaiStore.set(
    pageLayoutDraftComponentState.atomFamily({ instanceId: pageLayoutId }),
    {
      ...makeDraft([
        makeTab(tabId, [
          {
            ...makeWidget(widgetId, 0, tabId),
            type: WidgetType.FIELD,
            objectMetadataId: objectMetadataItem.id,
            title: fieldMetadataItem.label,
            configuration: {
              __typename: 'FieldConfiguration',
              configurationType: WidgetConfigurationType.FIELD,
              fieldMetadataId: fieldMetadataItem.id,
              fieldDisplayMode,
            },
          },
        ]),
      ]),
      id: pageLayoutId,
      objectMetadataId: objectMetadataItem.id,
    },
  );
  jotaiStore.set(
    pageLayoutEditingWidgetIdComponentState.atomFamily({
      instanceId: pageLayoutId,
    }),
    widgetId,
  );
  jotaiStore.set(
    recordTableWidgetViewDraftComponentState.atomFamily({
      instanceId: pageLayoutId,
    }),
    {},
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
