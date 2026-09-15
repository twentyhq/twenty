import styled from '@emotion/styled';
import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import {
  IconChevronDown,
  IconChevronUp,
  IconFolder,
  IconFolderRoot,
} from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Checkbox } from 'src/front-components/components/Checkbox';
import {
  GRANOLA_FOLDER_TREE_INDENT_PIXELS,
  GranolaFolderTreeBreadcrumb,
} from 'src/front-components/components/GranolaFolderTreeBreadcrumb';
import { type GranolaFolderTreeNode } from 'src/front-components/utils/compute-granola-folder-tree.util';
import { countNestedGranolaFolders } from 'src/front-components/utils/count-nested-granola-folders.util';
import { hasSelectedGranolaDescendant } from 'src/front-components/utils/has-selected-granola-descendant.util';

const StyledItem = styled.li`
  position: relative;
`;

const StyledNestedList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledCollapsibleWrapper = styled.div<{ $isExpanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isExpanded }) => ($isExpanded ? '1fr' : '0fr')};
  transition: grid-template-rows
    calc(${() => themeCssVariables.animation.duration.fast} * 1s) ease-out;
`;

const StyledCollapsibleContent = styled.div`
  overflow: hidden;
`;

const StyledRow = styled.div<{ $depth: number }>`
  align-items: center;
  border-radius: ${() => themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  height: 28px;
  padding-left: ${({ $depth }) => $depth * GRANOLA_FOLDER_TREE_INDENT_PIXELS}px;
  user-select: none;

  &:hover {
    background-color: ${() => themeCssVariables.background.transparent.lighter};
  }
`;

const StyledFolderContent = styled.div`
  align-items: center;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
  padding-left: ${() => themeCssVariables.spacing[1]};
  padding-right: ${() => themeCssVariables.spacing[1]};
`;

const StyledFolderName = styled.span<{ $disabled: boolean }>`
  color: ${({ $disabled }) =>
    $disabled
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.primary};
  font-size: ${() => themeCssVariables.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRightSection = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${() => themeCssVariables.spacing[1]};
  margin-left: auto;
`;

const StyledChildCount = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
  min-width: ${() => themeCssVariables.spacing[3]};
  text-align: right;
`;

const StyledExpandButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${() => themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: ${() => themeCssVariables.spacing[4]};
  justify-content: center;
  padding: 0;
  width: ${() => themeCssVariables.spacing[4]};

  &:hover {
    color: ${() => themeCssVariables.font.color.primary};
  }
`;

type GranolaFolderTreeItemProps = {
  node: GranolaFolderTreeNode;
  depth?: number;
  isLast?: boolean;
  parentsIsLastList?: boolean[];
  selectedFolderIds: Set<string>;
  coveredFolderIds: Set<string>;
  isSelectionFull: boolean;
  onToggleFolder: (folderId: string, checked: boolean) => void;
};

export const GranolaFolderTreeItem = ({
  node,
  depth = 0,
  isLast = false,
  parentsIsLastList = [],
  selectedFolderIds,
  coveredFolderIds,
  isSelectionFull,
  onToggleFolder,
}: GranolaFolderTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { folder, children } = node;
  const hasChildren = children.length > 0;
  const isSelected = selectedFolderIds.has(folder.id);
  const isCovered = coveredFolderIds.has(folder.id);
  const isChecked = isSelected || isCovered;
  const isIndeterminate =
    !isChecked && hasSelectedGranolaDescendant(node, selectedFolderIds);
  const isOnlySelectedFolder = isSelected && selectedFolderIds.size === 1;
  const isUnavailable = isCovered || (isSelectionFull && !isChecked);
  const isDisabled = isUnavailable || isOnlySelectedFolder;
  const FolderIcon = depth > 0 ? IconFolderRoot : IconFolder;
  const childParentsIsLastList =
    depth > 0 ? [...parentsIsLastList, isLast] : parentsIsLastList;

  return (
    <StyledItem>
      <StyledRow
        $depth={depth}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {depth > 0 && (
          <GranolaFolderTreeBreadcrumb
            depth={depth}
            isLast={isLast}
            parentsIsLastList={parentsIsLastList}
          />
        )}
        <StyledFolderContent>
          <FolderIcon size={ICON.size.md} stroke={ICON.stroke.sm} />
          <StyledFolderName $disabled={isUnavailable} title={folder.name}>
            {folder.name}
          </StyledFolderName>
          <StyledRightSection>
            {hasChildren && (
              <>
                <StyledChildCount>
                  {countNestedGranolaFolders(node)}
                </StyledChildCount>
                <StyledExpandButton
                  type="button"
                  aria-label={
                    isExpanded ? t('Collapse folder') : t('Expand folder')
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <IconChevronUp size={ICON.size.md} />
                  ) : (
                    <IconChevronDown size={ICON.size.md} />
                  )}
                </StyledExpandButton>
              </>
            )}
            <span onClick={(event) => event.stopPropagation()}>
              <Checkbox
                checked={isChecked}
                indeterminate={isIndeterminate}
                disabled={isDisabled}
                aria-label={folder.name}
                onChange={(checked) => onToggleFolder(folder.id, checked)}
              />
            </span>
          </StyledRightSection>
        </StyledFolderContent>
      </StyledRow>
      {hasChildren && (
        <StyledCollapsibleWrapper $isExpanded={isExpanded}>
          <StyledCollapsibleContent>
            <StyledNestedList>
              {children.map((child, index) => (
                <GranolaFolderTreeItem
                  key={child.folder.id}
                  node={child}
                  depth={depth + 1}
                  isLast={index === children.length - 1}
                  parentsIsLastList={childParentsIsLastList}
                  selectedFolderIds={selectedFolderIds}
                  coveredFolderIds={coveredFolderIds}
                  isSelectionFull={isSelectionFull}
                  onToggleFolder={onToggleFolder}
                />
              ))}
            </StyledNestedList>
          </StyledCollapsibleContent>
        </StyledCollapsibleWrapper>
      )}
    </StyledItem>
  );
};
