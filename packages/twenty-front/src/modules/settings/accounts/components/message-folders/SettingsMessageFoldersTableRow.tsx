import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsAccountsMessageFolderIcon } from '@/settings/accounts/components/message-folders/SettingsAccountsMessageFolderIcon';
import { formatFolderName } from '@/settings/accounts/components/message-folders/utils/formatFolderName.util';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Checkbox, CheckboxSize } from 'twenty-ui/input';

const INDENT_SIZE = 22;
const LINE_OFFSET = 8;
const BORDER_RADIUS = 4;

type StyledHierarchyLinesProps = {
  level: number;
  index: number;
  hasLine: boolean;
};

const StyledParentLine = styled.div<StyledHierarchyLinesProps>`
  bottom: 0;
  left: ${({ index }) => index * INDENT_SIZE + LINE_OFFSET}px;
  position: absolute;
  top: 0;
  width: 1px;
`;

type StyledHierarchyContainerProps = {
  level: number;
  isLastChild: boolean;
};

const StyledHierarchyContainer = styled.div<StyledHierarchyContainerProps>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  padding-left: ${({ level }) => level * INDENT_SIZE}px;
  position: relative;
  min-height: 40px;

  ${({ level, isLastChild, theme }) =>
    level > 0 &&
    `
    &::before {
      content: '';
      position: absolute;
      left: ${(level - 1) * INDENT_SIZE + LINE_OFFSET}px;
      top: 0;
      width: ${LINE_OFFSET}px;
      height: ${isLastChild ? 'calc(50% + 1px)' : '50%'};
      border-left: 1px solid white;
      border-bottom: 1px solid white;
      border-bottom-left-radius: ${BORDER_RADIUS}px;
    }

    &::after {
      content: '';
      position: absolute;
      left: ${(level - 1) * INDENT_SIZE + LINE_OFFSET}px;
      top: 50%;
      bottom: 0;
      width: 1px;
      background-color: white;
      display: ${isLastChild ? 'none' : 'block'};
    }
  `}
`;

const StyledFolderNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTableRow = styled(TableRow)``;

const StyledCheckboxCell = styled(TableCell)`
  display: flex;
  justify-content: flex-end;
`;

type SettingsMessageFoldersTableRowProps = {
  folder: MessageFolder;
  onSyncToggle: () => void;
  level?: number;
  parentChain?: boolean[];
  isLastChild?: boolean;
};

export const SettingsMessageFoldersTableRow = ({
  folder,
  onSyncToggle,
  level = 0,
  parentChain = [],
  isLastChild = false,
}: SettingsMessageFoldersTableRowProps) => {
  return (
    <StyledTableRow gridAutoColumns="1fr 120px">
      <TableCell>
        <StyledHierarchyContainer level={level} isLastChild={isLastChild}>
          {parentChain.map(
            (hasLine, index) =>
              hasLine && (
                <StyledParentLine
                  key={index}
                  level={level}
                  index={index}
                  hasLine={hasLine}
                />
              ),
          )}
          <StyledFolderNameCell>
            <SettingsAccountsMessageFolderIcon folder={folder} />
            {formatFolderName(folder.name)}
          </StyledFolderNameCell>
        </StyledHierarchyContainer>
      </TableCell>
      <StyledCheckboxCell>
        <Checkbox
          checked={folder.isSynced}
          onChange={onSyncToggle}
          size={CheckboxSize.Small}
        />
      </StyledCheckboxCell>
    </StyledTableRow>
  );
};
