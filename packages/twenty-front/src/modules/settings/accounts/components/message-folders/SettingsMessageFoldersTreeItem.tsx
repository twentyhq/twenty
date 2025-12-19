import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsAccountsMessageFolderIcon } from '@/settings/accounts/components/message-folders/SettingsAccountsMessageFolderIcon';
import { SettingsMessageFoldersBreadcrumb } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersBreadcrumb';
import { type MessageFolderTreeNode } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';
import { countNestedFolders } from '@/settings/accounts/components/message-folders/utils/countNestedFolders';
import { formatFolderName } from '@/settings/accounts/components/message-folders/utils/formatFolderName';
import { isFolderTreePartiallySelected } from '@/settings/accounts/components/message-folders/utils/isFolderTreePartiallySelected';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { Checkbox, CheckboxSize } from 'twenty-ui/input';

type SettingsMessageFoldersTreeItemProps = {
  depth?: number;
  folderTreeNode: MessageFolderTreeNode;
  isLast?: boolean;
  onToggleFolder: (folder: MessageFolder) => void;
  parentsIsLastList?: boolean[];
};

const BREADCRUMB_WIDTH = 24;

const StyledTreeItem = styled.li`
  position: relative;
`;

const StyledNestedList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledCollapsibleWrapper = styled.div<{ isExpanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ isExpanded }) => (isExpanded ? '1fr' : '0fr')};
  transition: grid-template-rows
    ${({ theme }) => theme.animation.duration.fast}s ease-out;
`;

const StyledCollapsibleContent = styled.div`
  overflow: hidden;
`;

const StyledTreeItemContent = styled.div<{ depth: number }>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  height: 28px;
  padding-left: ${({ depth }) => depth * BREADCRUMB_WIDTH}px;
  transition: background-color
    ${({ theme }) => theme.animation.duration.instant}s;
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledFolderContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledFolderInfo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
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
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: 0;
  width: ${({ theme }) => theme.spacing(4)};

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledCheckboxWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const SettingsMessageFoldersTreeItem = ({
  depth = 0,
  folderTreeNode,
  isLast = false,
  onToggleFolder,
  parentsIsLastList = [],
}: SettingsMessageFoldersTreeItemProps) => {
  const { t } = useLingui();
  const [isExpanded, setIsExpanded] = useState(true);

  const { children, folder, hasChildren } = folderTreeNode;
  const childCount = hasChildren ? countNestedFolders(folderTreeNode) : 0;
  const isIndeterminate =
    hasChildren && isFolderTreePartiallySelected(folderTreeNode);

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

  const childParentsIsLastList =
    depth > 0 ? [...parentsIsLastList, isLast] : parentsIsLastList;

  return (
    <StyledTreeItem>
      <StyledTreeItemContent depth={depth} onClick={handleRowClick}>
        {depth > 0 && (
          <SettingsMessageFoldersBreadcrumb
            depth={depth}
            isLast={isLast}
            parentsIsLastList={parentsIsLastList}
          />
        )}

        <StyledFolderContent>
          <StyledFolderInfo>
            <SettingsAccountsMessageFolderIcon
              folder={folder}
              isChildFolder={depth > 0}
            />
            <StyledFolderName>{formatFolderName(folder.name)}</StyledFolderName>
          </StyledFolderInfo>

          <StyledRightSection>
            {hasChildren && (
              <>
                <StyledChildCount>{childCount}</StyledChildCount>
                <StyledExpandButton
                  aria-label={
                    isExpanded ? t`Collapse folder` : t`Expand folder`
                  }
                  onClick={handleExpandToggle}
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

      {hasChildren && (
        <StyledCollapsibleWrapper isExpanded={isExpanded}>
          <StyledCollapsibleContent>
            <StyledNestedList>
              {children.map((child, index) => (
                <SettingsMessageFoldersTreeItem
                  key={child.folder.id}
                  depth={depth + 1}
                  folderTreeNode={child}
                  isLast={index === children.length - 1}
                  onToggleFolder={onToggleFolder}
                  parentsIsLastList={childParentsIsLastList}
                />
              ))}
            </StyledNestedList>
          </StyledCollapsibleContent>
        </StyledCollapsibleWrapper>
      )}
    </StyledTreeItem>
  );
};
