import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { useViewBarDropdownButton } from '@/ui/view-bar/hooks/useViewBarDropdownButton';

import { ColumnDefinition } from '../types/ColumnDefinition';

import { EntityTableHeaderOptions } from './EntityTableHeaderOptions';

type OwnProps = {
  column: ColumnDefinition<FieldMetadata>;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  primaryColumnKey: string;
};

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledIcon = styled.div`
  display: flex;

  & > svg {
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ColumnHead = ({
  column,
  isFirstColumn,
  isLastColumn,
  primaryColumnKey,
}: OwnProps) => {
  const theme = useTheme();

  const { openDropdown } = useViewBarDropdownButton({
    dropdownId: column.key + '-header',
  });

  return (
    <>
      <StyledTitle onClick={openDropdown}>
        <StyledIcon>
          {column.Icon && <column.Icon size={theme.icon.size.md} />}
        </StyledIcon>
        <StyledText>{column.name}</StyledText>
      </StyledTitle>
      <EntityTableHeaderOptions
        column={column}
        isFirstColumn={isFirstColumn}
        isLastColumn={isLastColumn}
        primaryColumnKey={primaryColumnKey}
      />
    </>
  );
};
