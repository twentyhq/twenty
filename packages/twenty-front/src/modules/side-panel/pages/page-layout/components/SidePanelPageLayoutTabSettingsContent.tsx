import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useDeletePageLayoutTab } from '@/page-layout/hooks/useDeletePageLayoutTab';
import { useDuplicatePageLayoutTab } from '@/page-layout/hooks/useDuplicatePageLayoutTab';
import { useMovePageLayoutTab } from '@/page-layout/hooks/useMovePageLayoutTab';
import { useResetPageLayoutTabToDefault } from '@/page-layout/hooks/useResetPageLayoutTabToDefault';
import { useSetAsPinnedTab } from '@/page-layout/hooks/useSetAsPinnedTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { CanvasTabSettingsContent } from '@/side-panel/pages/page-layout/components/CanvasTabSettingsContent';
import { RegularTabSettingsContent } from '@/side-panel/pages/page-layout/components/RegularTabSettingsContent';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

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
  const { resetPageLayoutTabToDefault } =
    useResetPageLayoutTabToDefault(pageLayoutId);

  if (!isDefined(pageLayoutTabSettingsOpenTabId)) {
    return null;
  }

  const tabsSorted = sortTabsByPosition(pageLayoutDraft.tabs);
  const currentIndex = tabsSorted.findIndex(
    (tabItem) => tabItem.id === pageLayoutTabSettingsOpenTabId,
  );
  if (currentIndex < 0) return null;
  const tab = tabsSorted[currentIndex];
  const isRecordPage = pageLayoutDraft.type === PageLayoutType.RECORD_PAGE;
  const hasPinnedTab = isRecordPage && tabsSorted.length > 1;
  const canMoveLeft = hasPinnedTab ? currentIndex > 1 : currentIndex > 0;
  const canMoveRight = currentIndex < tabsSorted.length - 1;
  const canDelete = tabsSorted.length > 1;
  const isAlreadyPinned = currentIndex === 0;
  const canSetAsPinned =
    isRecordPage && !isAlreadyPinned && tabsSorted.length > 1;

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

  const isCanvasTab = tab.layoutMode === PageLayoutTabLayoutMode.CANVAS;

  if (isCanvasTab) {
    return (
      <CanvasTabSettingsContent
        pageLayoutId={pageLayoutId}
        canvasWidget={tab.widgets.at(0)}
        canSetAsPinned={canSetAsPinned}
        canMoveLeft={canMoveLeft}
        canMoveRight={canMoveRight}
        isResetToDefaultDisabled={isResetToDefaultDisabled}
        canDelete={canDelete}
        onMoveLeft={() => moveLeft(tab.id)}
        onMoveRight={() => moveRight(tab.id)}
        onSetAsPinned={() => setAsPinnedTab(tab.id)}
        onResetToDefault={handleResetToDefault}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <RegularTabSettingsContent
      canSetAsPinned={canSetAsPinned}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      isResetToDefaultDisabled={isResetToDefaultDisabled}
      canDelete={canDelete}
      onMoveLeft={() => moveLeft(tab.id)}
      onMoveRight={() => moveRight(tab.id)}
      onSetAsPinned={() => setAsPinnedTab(tab.id)}
      onDuplicate={() => {
        const newTabId = duplicateTab(tab.id);
        navigate(`#${newTabId}`);
      }}
      onResetToDefault={handleResetToDefault}
      onDelete={handleDelete}
    />
  );
};
