import styled from '@emotion/styled';
import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Label } from 'twenty-ui/typography';

import { Checkbox } from 'src/front-components/components/Checkbox';
import { GranolaFolderTreeItem } from 'src/front-components/components/GranolaFolderTreeItem';
import { StyledSettingsHint } from 'src/front-components/components/StyledSettingsHint';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';
import { computeGranolaFolderAncestorIds } from 'src/front-components/utils/compute-granola-folder-ancestor-ids.util';
import { computeGranolaFolderTree } from 'src/front-components/utils/compute-granola-folder-tree.util';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSearchInputContainer = styled.div`
  margin-bottom: ${() => themeCssVariables.spacing[2]};
`;

const StyledLabelContainer = styled.span`
  align-items: center;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  margin-bottom: ${() => themeCssVariables.spacing[2]};
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${() => themeCssVariables.border.color.light};
  display: flex;
  height: ${() => themeCssVariables.spacing[6]};
  justify-content: space-between;
  padding: 0 ${() => themeCssVariables.spacing[1]};
`;

const StyledTreeList = styled.ul`
  list-style: none;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
  padding: ${() => themeCssVariables.spacing[2]} 0;
`;

type GranolaFolderTreeProps = {
  folders: GranolaSettingsFolder[];
  selectedFolderIds: string[];
  selectionLimit: number;
  onToggleFolder: (folderId: string, checked: boolean) => void;
  onReplaceSelection: (folderIds: string[]) => void;
};

export const GranolaFolderTree = ({
  folders,
  selectedFolderIds,
  selectionLimit,
  onToggleFolder,
  onReplaceSelection,
}: GranolaFolderTreeProps) => {
  const [search, setSearch] = useState('');

  const selectedFolderIdSet = new Set(selectedFolderIds);
  const ancestorIdsByFolderId = computeGranolaFolderAncestorIds(folders);
  const coveredFolderIds = new Set(
    folders
      .filter((folder) =>
        (ancestorIdsByFolderId.get(folder.id) ?? []).some((ancestorId) =>
          selectedFolderIdSet.has(ancestorId),
        ),
      )
      .map((folder) => folder.id),
  );
  const rootFolderIds = computeGranolaFolderTree(folders).map(
    (node) => node.folder.id,
  );
  const isEveryFolderSelected = rootFolderIds.every((folderId) =>
    selectedFolderIdSet.has(folderId),
  );
  const canSelectEveryFolder = rootFolderIds.length <= selectionLimit;
  const normalizedSearch = search.trim().toLowerCase();
  const tree = computeGranolaFolderTree(
    normalizedSearch === ''
      ? folders
      : folders.filter((folder) =>
          folder.name.toLowerCase().includes(normalizedSearch),
        ),
  );

  const handleToggleAllFolders = () => {
    onReplaceSelection(isEveryFolderSelected ? [] : rootFolderIds);
  };

  return (
    <StyledContainer>
      <StyledSearchInputContainer>
        <StyledSettingsTextInput
          type="text"
          placeholder={t('Search folders...')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </StyledSearchInputContainer>
      <StyledLabelContainer>
        <Label>{t('Folders')}</Label>
      </StyledLabelContainer>
      <StyledSectionHeader>
        <Label>{t('Toggle all folders')}</Label>
        <Checkbox
          checked={isEveryFolderSelected}
          indeterminate={!isEveryFolderSelected && selectedFolderIds.length > 0}
          disabled={!canSelectEveryFolder}
          aria-label={t('Toggle all folders')}
          onChange={handleToggleAllFolders}
        />
      </StyledSectionHeader>
      {tree.length === 0 && (
        <StyledSettingsHint>
          {t('No folder matches your search.')}
        </StyledSettingsHint>
      )}
      <StyledTreeList>
        {tree.map((node, index) => (
          <GranolaFolderTreeItem
            key={node.folder.id}
            node={node}
            isLast={index === tree.length - 1}
            selectedFolderIds={selectedFolderIdSet}
            coveredFolderIds={coveredFolderIds}
            isSelectionFull={selectedFolderIds.length >= selectionLimit}
            onToggleFolder={onToggleFolder}
          />
        ))}
      </StyledTreeList>
    </StyledContainer>
  );
};
