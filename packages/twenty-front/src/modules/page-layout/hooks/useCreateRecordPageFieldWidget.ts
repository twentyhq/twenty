import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultFieldWidget } from '@/page-layout/utils/createDefaultFieldWidget';
import { useFieldWidgetEligibleFields } from '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields';
import { getFieldWidgetDefaultDisplayMode } from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const useCreateRecordPageFieldWidget = () => {
  const { tabId } = usePageLayoutContentContext();

  const { targetObjectNameSingular } = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetObjectNameSingular,
  });

  const allFieldWidgetFields = useFieldWidgetEligibleFields(
    targetObjectNameSingular,
  );

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
  );

  const store = useStore();

  const createRecordPageFieldWidget = useCallback(() => {
    const activeTab = currentPageLayout.tabs.find((tab) => tab.id === tabId);
    const existingWidgets = activeTab?.widgets ?? [];

    const usedFieldMetadataIds = new Set(
      existingWidgets
        .filter(
          (widget) =>
            widget.configuration.configurationType ===
            WidgetConfigurationType.FIELD,
        )
        .map((widget) => {
          const configuration = widget.configuration as {
            fieldMetadataId: string;
          };
          return configuration.fieldMetadataId;
        }),
    );

    const unusedField = allFieldWidgetFields.find(
      (field) => !usedFieldMetadataIds.has(field.id),
    );

    const selectedField = unusedField ?? allFieldWidgetFields[0];

    const fieldMetadataId = selectedField?.id ?? '';
    const title = selectedField?.label ?? '';

    const positionIndex = existingWidgets.length;
    const widgetId = uuidv4();

    const newWidget = createDefaultFieldWidget({
      id: widgetId,
      pageLayoutTabId: tabId,
      title,
      fieldMetadataId,
      fieldDisplayMode: isDefined(selectedField)
        ? getFieldWidgetDefaultDisplayMode(selectedField.type)
        : undefined,
      objectMetadataId: objectMetadataItem.id,
      positionIndex,
    });

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
    }));
  }, [
    allFieldWidgetFields,
    currentPageLayout.tabs,
    objectMetadataItem.id,
    pageLayoutDraftState,
    store,
    tabId,
  ]);

  return { createRecordPageFieldWidget };
};
