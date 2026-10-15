import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useCreatePageLayoutWidget } from '@/page-layout/hooks/useCreatePageLayoutWidget';
import { useRemovePageLayoutWidgetAndPreservePosition } from '@/page-layout/hooks/useRemovePageLayoutWidgetAndPreservePosition';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { useAddDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget';
import { useViewWidgetSelectableViews } from '@/page-layout/widgets/view/hooks/useViewWidgetSelectableViews';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { getDefaultWidgetObjectMetadataItem } from '@/side-panel/pages/page-layout/utils/getDefaultWidgetObjectMetadataItem';
import { isExistingWidgetMissingOrDifferentType } from '@/side-panel/pages/page-layout/utils/isExistingWidgetMissingOrDifferentType';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconTable } from 'twenty-ui/icon';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const SidePanelPageLayoutDashboardViewWidgetTypeSelect = () => {
  const { pageLayoutId, targetRecordIdentifier } =
    usePageLayoutSidePanelTarget();

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType: pageLayoutDraft.type,
    targetRecordIdentifier,
  });

  const { createPageLayoutWidget } = useCreatePageLayoutWidget({
    pageLayoutId,
    tabListInstanceId,
  });

  const { removePageLayoutWidgetAndPreservePosition } =
    useRemovePageLayoutWidgetAndPreservePosition(pageLayoutId);

  const { addDraftViewForRecordTableWidget } =
    useAddDraftViewForRecordTableWidget(pageLayoutId);

  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  const firstAvailableObjectMetadataItem = getDefaultWidgetObjectMetadataItem(
    readableObjectMetadataItems,
  );

  const { selectableViews: firstAvailableObjectSelectableViews } =
    useViewWidgetSelectableViews(firstAvailableObjectMetadataItem?.id);

  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useAtomComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const handleNavigateToExistingViewSettings = () => {
    if (
      isExistingWidgetMissingOrDifferentType(
        widgetInEditMode?.type,
        WidgetType.VIEW,
      )
    ) {
      if (isDefined(pageLayoutEditingWidgetId)) {
        removePageLayoutWidgetAndPreservePosition(pageLayoutEditingWidgetId);
      }

      const newViewWidget = createPageLayoutWidget({
        type: WidgetType.VIEW,
        title: firstAvailableObjectMetadataItem?.labelPlural ?? t`Saved view`,
        configuration: {
          __typename: 'ViewConfiguration',
          configurationType: WidgetConfigurationType.VIEW,
          viewId: firstAvailableObjectSelectableViews[0]?.id,
        },
        objectMetadataId: firstAvailableObjectMetadataItem?.id,
      });

      setPageLayoutEditingWidgetId(newViewWidget.id);
    }

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.DashboardViewWidgetSettings,
      focusTitleInput: false,
    });
  };

  const handleNavigateToNewViewSettings = () => {
    if (
      isExistingWidgetMissingOrDifferentType(
        widgetInEditMode?.type,
        WidgetType.RECORD_TABLE,
      )
    ) {
      if (isDefined(pageLayoutEditingWidgetId)) {
        removePageLayoutWidgetAndPreservePosition(pageLayoutEditingWidgetId);
      }

      const newRecordTableWidget = createPageLayoutWidget({
        type: WidgetType.RECORD_TABLE,
        title: firstAvailableObjectMetadataItem?.labelPlural ?? 'Record Table',
        configuration: {
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          isUIEditable: pageLayoutDraft.type === PageLayoutType.RECORD_PAGE,
        },
        objectMetadataId: firstAvailableObjectMetadataItem?.id,
      });

      setPageLayoutEditingWidgetId(newRecordTableWidget.id);

      addDraftViewForRecordTableWidget(
        newRecordTableWidget.id,
        firstAvailableObjectMetadataItem,
      );
    }

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.DashboardRecordTableSettings,
      focusTitleInput: false,
    });
  };

  return (
    <SidePanelList selectableItemIds={['existing-view', 'new-view']}>
      <SidePanelGroup heading={t`View`}>
        <SelectableListItem
          itemId="existing-view"
          onEnter={handleNavigateToExistingViewSettings}
        >
          <CommandMenuItem
            Icon={IconTable}
            label={t`Existing view`}
            id="existing-view"
            onClick={handleNavigateToExistingViewSettings}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="new-view"
          onEnter={handleNavigateToNewViewSettings}
        >
          <CommandMenuItem
            Icon={IconPlus}
            label={t`New view`}
            id="new-view"
            onClick={handleNavigateToNewViewSettings}
          />
        </SelectableListItem>
      </SidePanelGroup>
    </SidePanelList>
  );
};
