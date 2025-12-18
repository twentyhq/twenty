import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsAccountsMessageFolderIcon } from '@/settings/accounts/components/message-folders/SettingsAccountsMessageFolderIcon';

import { type MessageFolderTreeNode } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';
import { formatFolderName } from '@/settings/accounts/components/message-folders/utils/formatFolderName';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { Checkbox, CheckboxSize } from 'twenty-ui/input';

type SettingsMessageFoldersTreeItemProps = {
  folderTreeNode: MessageFolderTreeNode;
  onToggleFolder: (folder: MessageFolder) => void;
  depth?: number;
  isLast?: boolean;
  ancestorIsLastFlags?: boolean[];
};

const BREADCRUMB_WIDTH = 24;
const ICON_CENTER_OFFSET = 8;

const StyledTreeItem = styled.li`
  position: relative;
`;

const StyledNestedList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledTreeItemContent = styled.div<{ depth: number }>`
  display: flex;
  align-items: center;
  height: 28px;
  cursor: pointer;
  transition: background-color
    ${({ theme }) => theme.animation.duration.instant}s;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding-left: ${({ depth }) => depth * BREADCRUMB_WIDTH}px;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledBreadcrumbOverlay = styled.div<{ depth: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 28px;
  width: ${({ depth }) => depth * BREADCRUMB_WIDTH}px;
  pointer-events: none;
`;

const StyledAncestorLine = styled.div<{
  showLine: boolean;
  ancestorIndex: number;
}>`
  background: ${({ theme, showLine }) =>
    showLine ? theme.border.color.strong : 'transparent'};
  height: 28px;
  left: ${({ ancestorIndex }) =>
    ancestorIndex * BREADCRUMB_WIDTH + ICON_CENTER_OFFSET}px;
  position: absolute;
  top: 0;
  width: 1px;
`;

const StyledBreadcrumbConnector = styled.div<{
  depth: number;
  isLast: boolean;
}>`
  position: absolute;
  left: ${({ depth }) => (depth - 1) * BREADCRUMB_WIDTH + ICON_CENTER_OFFSET}px;
  top: 0;
  height: 28px;
  width: ${BREADCRUMB_WIDTH - ICON_CENTER_OFFSET}px;
`;

const StyledVerticalLineTop = styled.div`
  background: ${({ theme }) => theme.border.color.strong};
  height: 12px;
  left: 0;
  position: absolute;
  top: 0;
  width: 1px;
`;

const StyledRoundedCorner = styled.div`
  position: absolute;
  left: 0;
  top: 6px;
  height: 8px;
  width: 8px;
  border-left: 1px solid ${({ theme }) => theme.border.color.strong};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.strong};
  border-bottom-left-radius: 4px;
`;

const StyledVerticalLineBottom = styled.div`
  background: ${({ theme }) => theme.border.color.strong};
  height: 16px;
  left: 0;
  position: absolute;
  top: 12px;
  width: 1px;
`;

const StyledFolderContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
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

const StyledRightSection = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: auto;
`;

const StyledChildCount = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  min-width: ${({ theme }) => theme.spacing(3)};
  text-align: right;
`;

const StyledExpandButton = styled.button`
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

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledCheckboxWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const countTotalChildren = (node: MessageFolderTreeNode): number => {
  let count = node.children.length;
  for (const child of node.children) {
    count += countTotalChildren(child);
  }
  return count;
};

const getIndeterminateState = (node: MessageFolderTreeNode): boolean => {
  if (!node.hasChildren) return false;

  const allSynced = checkAllSynced(node);
  const noneSynced = checkNoneSynced(node);

  return !allSynced && !noneSynced;
};

const checkAllSynced = (node: MessageFolderTreeNode): boolean => {
  if (!node.folder.isSynced) return false;
  return node.children.every((child) => checkAllSynced(child));
};

const checkNoneSynced = (node: MessageFolderTreeNode): boolean => {
  if (node.folder.isSynced) return false;
  return node.children.every((child) => checkNoneSynced(child));
};

type FolderBreadcrumbProps = {
  depth: number;
  isLast: boolean;
  ancestorIsLastFlags: boolean[];
};

const FolderBreadcrumb = ({
  depth,
  isLast,
  ancestorIsLastFlags,
}: FolderBreadcrumbProps) => {
  return (
    <StyledBreadcrumbOverlay depth={depth}>
      {ancestorIsLastFlags.map((ancestorIsLast, index) => (
        <StyledAncestorLine
          key={index}
          showLine={!ancestorIsLast}
          ancestorIndex={index}
        />
      ))}
      <StyledBreadcrumbConnector depth={depth} isLast={isLast}>
        <StyledVerticalLineTop />
        <StyledRoundedCorner />
        {!isLast && <StyledVerticalLineBottom />}
      </StyledBreadcrumbConnector>
    </StyledBreadcrumbOverlay>
  );
};

export const SettingsMessageFoldersTreeItem = ({
  folderTreeNode,
  onToggleFolder,
  depth = 0,
  isLast = false,
  ancestorIsLastFlags = [],
}: SettingsMessageFoldersTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { folder, children, hasChildren } = folderTreeNode;

  const childCount = hasChildren ? countTotalChildren(folderTreeNode) : 0;
  const isIndeterminate = getIndeterminateState(folderTreeNode);

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

  const newAncestorFlags =
    depth > 0 ? [...ancestorIsLastFlags, isLast] : ancestorIsLastFlags;

  return (
    <StyledTreeItem>
      <StyledTreeItemContent depth={depth} onClick={handleRowClick}>
        {depth > 0 && (
          <FolderBreadcrumb
            depth={depth}
            isLast={isLast}
            ancestorIsLastFlags={ancestorIsLastFlags}
          />
        )}

        <StyledFolderContent>
          <StyledFolderInfo>
            <SettingsAccountsMessageFolderIcon folder={folder} />
            <StyledFolderName>{formatFolderName(folder.name)}</StyledFolderName>
          </StyledFolderInfo>

          <StyledRightSection>
            {hasChildren && (
              <>
                <StyledChildCount>{childCount}</StyledChildCount>
                <StyledExpandButton
                  onClick={handleExpandToggle}
                  aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
                >
                  {isExpanded ? (
                    <IconChevronUp size={16} />
                  ) : (
                    <IconChevronDown size={16} />
                  )}
                </StyledExpandButton>
              </>
            )}

            <StyledCheckboxWrapper onClick={handleCheckboxClick}>
              <Checkbox
                checked={folder.isSynced}
                indeterminate={isIndeterminate}
                onChange={() => onToggleFolder(folder)}
                size={CheckboxSize.Small}
              />
            </StyledCheckboxWrapper>
          </StyledRightSection>
        </StyledFolderContent>
      </StyledTreeItemContent>

      {hasChildren && isExpanded && (
        <StyledNestedList>
          {children.map((child, index) => (
            <SettingsMessageFoldersTreeItem
              key={child.folder.id}
              folderTreeNode={child}
              onToggleFolder={onToggleFolder}
              depth={depth + 1}
              isLast={index === children.length - 1}
              ancestorIsLastFlags={newAncestorFlags}
            />
          ))}
        </StyledNestedList>
      )}
    </StyledTreeItem>
  );
};
