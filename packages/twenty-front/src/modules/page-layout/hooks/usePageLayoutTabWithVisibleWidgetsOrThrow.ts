import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useWidgetVisibilityContext } from '@/page-layout/hooks/useWidgetVisibilityContext';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const usePageLayoutTabWithVisibleWidgetsOrThrow = (
  tabId: string,
): PageLayoutTab => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const widgetVisibilityContext = useWidgetVisibilityContext();
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const { objectMetadataItems } = useObjectMetadataItems();

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const targetObjectNameSingular =
    targetRecordIdentifier?.targetObjectNameSingular;

  const tab = currentPageLayout.tabs.find((tab) => tab.id === tabId);

  // Memoized because consumers feed this widget array to dnd-kit and to
  // memoized callbacks, which a fresh array on every render would defeat.
  const tabWithVisibleWidgets = useMemo(() => {
    if (!isDefined(tab)) {
      return undefined;
    }

    const activeWidgets = tab.widgets.filter((widget) => widget.isActive);

    const widgets = isPageLayoutInEditMode
      ? activeWidgets
      : filterVisibleWidgets({
          widgets: activeWidgets,
          context: widgetVisibilityContext,
        });

    const targetObjectFields =
      objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === targetObjectNameSingular,
      )?.fields ?? [];

    const displayedWidgets = widgets.filter((widget) => {
      if (!isFieldWidget(widget)) {
        return true;
      }

      const fieldMetadataIdOrName = widget.configuration.fieldMetadataId;

      const fieldName = targetObjectFields.find(
        (field) =>
          field.name === fieldMetadataIdOrName ||
          field.id === fieldMetadataIdOrName,
      )?.name;

      if (!isDefined(fieldName)) {
        return true;
      }

      return !isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: targetObjectNameSingular,
        fieldName,
        isWorkflowCoreIndexPageEnabled,
      });
    });

    return {
      ...tab,
      widgets:
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? sortWidgetsByVerticalListPosition(displayedWidgets)
          : displayedWidgets,
    };
  }, [
    isPageLayoutInEditMode,
    tab,
    widgetVisibilityContext,
    objectMetadataItems,
    targetObjectNameSingular,
    isWorkflowCoreIndexPageEnabled,
  ]);

  if (!isDefined(tabWithVisibleWidgets)) {
    throw new Error('Tab not found');
  }

  return tabWithVisibleWidgets;
};
