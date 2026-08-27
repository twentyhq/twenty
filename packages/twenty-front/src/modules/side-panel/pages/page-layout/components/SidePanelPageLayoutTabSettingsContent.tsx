import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useDeletePageLayoutTab } from '@/page-layout/hooks/useDeletePageLayoutTab';
import { useDuplicatePageLayoutTab } from '@/page-layout/hooks/useDuplicatePageLayoutTab';
import { useMovePageLayoutTab } from '@/page-layout/hooks/useMovePageLayoutTab';
import { useResetPageLayoutTabToDefault } from '@/page-layout/hooks/useResetPageLayoutTabToDefault';
import { useSetAsPinnedTab } from '@/page-layout/hooks/useSetAsPinnedTab';
import { useUnpinTab } from '@/page-layout/hooks/useUnpinTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { getIsFirstTabPinned } from '@/page-layout/utils/getIsFirstTabPinned';
import { getIsSingleWidgetTab } from '@/page-layout/utils/getIsSingleWidgetTab';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { RegularTabSettingsContent } from '@/side-panel/pages/page-layout/components/RegularTabSettingsContent';
import { SingleWidgetTabSettingsContent } from '@/side-panel/pages/page-layout/components/SingleWidgetTabSettingsContent';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

type SidePanelPageLayoutTabSettingsContentProps = {
  pageLayoutId: string;
  recordId: string;
};

export const SidePanelPageLayoutTabSettingsContent = ({
  pageLayoutId,
  recordId,
}: SidePanelPageLayoutTabSettingsContentProps) => {
  const { closeSidePanelMenu } = useSidePanelMenu();

  const navigate = useNavigate();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType: pageLayoutDraft.type,
    targetRecordIdentifier: { id: recordId, targetObjectNameSingular: '' },
  });

  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const [pageLayoutTabSettingsOpenTabId, setPageLayoutTabSettingsOpenTabId] =
    useAtomComponentState(
      pageLayoutTabSettingsOpenTabIdComponentState,
      pageLayoutId,
    );

  const { moveLeft, moveRight } = useMovePageLayoutTab(pageLayoutId);
  const { deleteTab } = useDeletePageLayoutTab({
    pageLayoutId,
    tabListInstanceId,
  });
  const { duplicateTab } = useDuplicatePageLayoutTab({
    pageLayoutId,
    tabListInstanceId,
  });
  const { setAsPinnedTab } = useSetAsPinnedTab(pageLayoutId);
  const { unpinTab } = useUnpinTab(pageLayoutId);
  const { resetPageLayoutTabToDefault } =
    useResetPageLayoutTabToDefault(pageLayoutId);

  if (!isDefined(pageLayoutTabSettingsOpenTabId)) {
    return null;
  }

  // Deleting a tab only deactivates it in the draft, and the placement actions
  // have to line up with the tabs the layout actually renders.
  const tabsSorted = sortTabsByPosition(
    pageLayoutDraft.tabs.filter((draftTab) => draftTab.isActive),
  );
  const currentIndex = tabsSorted.findIndex(
    (tabItem) => tabItem.id === pageLayoutTabSettingsOpenTabId,
  );
  if (currentIndex < 0) return null;
  const tab = tabsSorted[currentIndex];
  const isRecordPage = pageLayoutDraft.type === PageLayoutType.RECORD_PAGE;
  const hasPinnedTab =
    isRecordPage &&
    tabsSorted.length > 1 &&
    getIsFirstTabPinned(pageLayoutDraft);
  const canMoveLeft = hasPinnedTab ? currentIndex > 1 : currentIndex > 0;
  const canMoveRight = currentIndex < tabsSorted.length - 1;
  const canDelete = tabsSorted.length > 1;
  const isAlreadyPinned = hasPinnedTab && currentIndex === 0;
  const canSetAsPinned =
    isRecordPage && !isAlreadyPinned && tabsSorted.length > 1;
  const canUnpin = isAlreadyPinned;

  const isResetToDefaultDisabled =
    !isNonEmptyString(tab.applicationId) ||
    tab.applicationId === currentWorkspace?.workspaceCustomApplication?.id;

  const handleDelete = () => {
    deleteTab(tab.id);
    setPageLayoutTabSettingsOpenTabId(null);
    closeSidePanelMenu();
  };

  const handleResetToDefault = () => {
    resetPageLayoutTabToDefault(tab.id);
  };

  const handleUnpin = () => {
    unpinTab();
    setActiveTabId(tab.id);
    navigate(`#${tab.id}`);
  };

  const activeWidgets = tab.widgets.filter((widget) => widget.isActive);

  const isSingleWidgetTab = getIsSingleWidgetTab({ tab });

  if (isSingleWidgetTab) {
    return (
      <SingleWidgetTabSettingsContent
        pageLayoutId={pageLayoutId}
        singleWidget={activeWidgets.at(0)!}
        canSetAsPinned={canSetAsPinned}
        canUnpin={canUnpin}
        canMoveLeft={canMoveLeft}
        canMoveRight={canMoveRight}
        isResetToDefaultDisabled={isResetToDefaultDisabled}
        canDelete={canDelete}
        onMoveLeft={() => moveLeft(tab.id)}
        onMoveRight={() => moveRight(tab.id)}
        onSetAsPinned={() => setAsPinnedTab(tab.id)}
        onUnpin={handleUnpin}
        onResetToDefault={handleResetToDefault}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <RegularTabSettingsContent
      canSetAsPinned={canSetAsPinned}
      canUnpin={canUnpin}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      isResetToDefaultDisabled={isResetToDefaultDisabled}
      canDelete={canDelete}
      onMoveLeft={() => moveLeft(tab.id)}
      onMoveRight={() => moveRight(tab.id)}
      onSetAsPinned={() => setAsPinnedTab(tab.id)}
      onUnpin={handleUnpin}
      onDuplicate={() => {
        const newTabId = duplicateTab(tab.id);
        navigate(`#${newTabId}`);
      }}
      onResetToDefault={handleResetToDefault}
      onDelete={handleDelete}
    />
  );
};
