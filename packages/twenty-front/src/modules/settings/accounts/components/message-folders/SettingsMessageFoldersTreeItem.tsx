import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsAccountsMessageFolderIcon } from '@/settings/accounts/components/message-folders/SettingsAccountsMessageFolderIcon';

import { type MessageFolderTreeNode } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';
import { formatFolderName } from '@/settings/accounts/components/message-folders/utils/formatFolderName';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconChevronRight } from 'twenty-ui/display';
import { Checkbox, CheckboxSize } from 'twenty-ui/input';

type SettingsMessageFoldersTreeItemProps = {
  folderTreeNode: MessageFolderTreeNode;
  onToggleFolder: (folder: MessageFolder) => void;
  depth?: number;
};

const StyledTreeItem = styled.li<{ hasChildren: boolean; depth: number }>`
  position: relative;
  margin-left: ${({ hasChildren, depth, theme }) =>
    !hasChildren && depth > 0 ? theme.spacing(3) : 0};

  &:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledNestedList = styled.ul`
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  list-style: none;
  margin: ${({ theme }) => theme.spacing(1)} 0 0
    ${({ theme }) => theme.spacing(3)};
  padding: 0;
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledTreeItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: background-color
    ${({ theme }) => theme.animation.duration.instant}s;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledExpandButton = styled.button<{ isExpanded: boolean }>`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
  height: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};
  transition: transform ${({ theme }) => theme.animation.duration.instant}s;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledFolderContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
`;

const StyledFolderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;
  min-width: 0;
`;

const StyledFolderName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCheckboxWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const SettingsMessageFoldersTreeItem = ({
  folderTreeNode,
  onToggleFolder,
  depth = 0,
}: SettingsMessageFoldersTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { folder, children, hasChildren } = folderTreeNode;

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleRowClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <StyledTreeItem hasChildren={hasChildren} depth={depth}>
      <StyledTreeItemContent onClick={handleRowClick}>
        {hasChildren && (
          <StyledExpandButton
            isExpanded={isExpanded}
            onClick={handleExpandToggle}
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            <IconChevronRight size={16} />
          </StyledExpandButton>
        )}

        <StyledFolderContent>
          <StyledFolderInfo>
            <SettingsAccountsMessageFolderIcon folder={folder} />
            <StyledFolderName>{formatFolderName(folder.name)}</StyledFolderName>
          </StyledFolderInfo>

          <StyledCheckboxWrapper onClick={handleCheckboxClick}>
            <Checkbox
              checked={folder.isSynced}
              onChange={() => onToggleFolder(folder)}
              size={CheckboxSize.Small}
            />
          </StyledCheckboxWrapper>
        </StyledFolderContent>
      </StyledTreeItemContent>

      {hasChildren && isExpanded && (
        <StyledNestedList>
          {children.map((child) => (
            <SettingsMessageFoldersTreeItem
              key={child.folder.id}
              folderTreeNode={child}
              onToggleFolder={onToggleFolder}
              depth={depth + 1}
            />
          ))}
        </StyledNestedList>
      )}
    </StyledTreeItem>
  );
};
