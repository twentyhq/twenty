import { TabActionsDropdown } from '@/ui/layout/tab-list/components/TabActionsDropdown';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { TabInlineRenameInput } from '@/ui/layout/tab-list/components/TabInlineRenameInput';
import { TabListDropdownMenuItem } from '@/ui/layout/tab-list/components/TabListDropdownMenuItem';
import { useTabListContextOrThrow } from '@/ui/layout/tab-list/contexts/TabListContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledMenuItemWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  &:hover .actions-button {
    opacity: 1;
  }

  &:hover > div:first-child > svg:last-child {
    opacity: 0;
  }
`;

const StyledActionsButtonWrapper = styled.div`
  opacity: 0;
  pointer-events: auto;
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
  top: 50%;
  transform: translateY(-50%);
  transition: opacity ${({ theme }) => theme.animation.duration.instant}s;
`;

const StyledInlineRenameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

type TabListDropdownMenuItemWithActionsProps = {
  tab: SingleTabProps;
  activeTabId: string | null;
  loading?: boolean;
  onSelect: (tabId: string) => void;
  disableClick?: boolean;
};

export const TabListDropdownMenuItemWithActions = ({
  tab,
  activeTabId,
  loading,
  onSelect,
  disableClick,
}: TabListDropdownMenuItemWithActionsProps) => {
  const {
    tabActions,
    visibleTabs,
    tabInRenameMode,
    onEnterRenameMode,
    onExitRenameMode,
  } = useTabListContextOrThrow();

  const hasTabActions = isDefined(tabActions);
  const canDeleteTab = visibleTabs.length > 1;
  const isInRenameMode = tabInRenameMode === tab.id;

  const handleRename = () => {
    onEnterRenameMode(tab.id);
  };

  const handleRenameSave = (newTitle: string) => {
    onExitRenameMode();
    if (newTitle !== tab.title && newTitle.length > 0) {
      tabActions?.onRename?.(tab.id, newTitle);
    }
  };

  const handleRenameCancel = () => {
    onExitRenameMode();
  };

  const handleDuplicateLeft = () => {
    tabActions?.onDuplicate?.(tab.id, 'before');
  };

  const handleDuplicateRight = () => {
    tabActions?.onDuplicate?.(tab.id, 'after');
  };

  const handleDelete = () => {
    tabActions?.onDelete?.(tab.id);
  };

  if (isInRenameMode) {
    return (
      <StyledInlineRenameWrapper>
        <TabAvatar tab={tab} />
        <TabInlineRenameInput
          initialValue={tab.title}
          onSave={handleRenameSave}
          onCancel={handleRenameCancel}
        />
      </StyledInlineRenameWrapper>
    );
  }

  const menuItem = (
    <TabListDropdownMenuItem
      tab={tab}
      activeTabId={activeTabId}
      loading={loading}
      onSelect={onSelect}
      disableClick={disableClick}
    />
  );

  if (!hasTabActions) {
    return menuItem;
  }

  const actionsButton = (
    <StyledActionsButtonWrapper className="actions-button">
      <LightIconButton Icon={IconDotsVertical} size="small" accent="tertiary" />
    </StyledActionsButtonWrapper>
  );

  return (
    <StyledMenuItemWrapper>
      {menuItem}
      <TabActionsDropdown
        dropdownId={`tab-overflow-actions-${tab.id}`}
        clickableComponent={actionsButton}
        onRename={handleRename}
        onDuplicateLeft={handleDuplicateLeft}
        onDuplicateRight={handleDuplicateRight}
        onDelete={handleDelete}
        isDeleteDisabled={!canDeleteTab}
        duplicateLeftLabel={t`Duplicate Above`}
        duplicateRightLabel={t`Duplicate Below`}
      />
    </StyledMenuItemWrapper>
  );
};
