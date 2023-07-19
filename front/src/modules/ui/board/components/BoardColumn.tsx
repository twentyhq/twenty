import React, { ChangeEvent } from 'react';
import styled from '@emotion/styled';

import { debounce } from '~/utils/debounce';

import { EditColumnTitleInput } from './EditColumnTitleInput';

export const StyledColumn = styled.div<{ isFirstColumn: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-left: 1px solid
    ${({ theme, isFirstColumn }) =>
      isFirstColumn ? 'none' : theme.border.color.light};
  display: flex;
  flex-direction: column;
  min-width: 200px;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 24px;
  justify-content: left;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const StyledColumnTitle = styled.h3`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ color }) => color};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledAmount = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

type OwnProps = {
  colorCode?: string;
  title: string;
  pipelineStageId?: string;
  onTitleEdit: (title: string) => void;
  totalAmount?: number;
  children: React.ReactNode;
  isFirstColumn: boolean;
};

export function BoardColumn({
  colorCode,
  title,
  onTitleEdit,
  totalAmount,
  children,
  isFirstColumn,
}: OwnProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(title);

  const debouncedOnUpdate = debounce(onTitleEdit, 200);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value);
    debouncedOnUpdate(event.target.value);
  };

  return (
    <StyledColumn isFirstColumn={isFirstColumn}>
      <StyledHeader onClick={() => setIsEditing(true)}>
        <StyledColumnTitle color={colorCode}>
          {isEditing ? (
            <EditColumnTitleInput
              color={colorCode}
              onFocusLeave={() => setIsEditing(false)}
              value={internalValue}
              onChange={handleChange}
            />
          ) : (
            <div>{title}</div>
          )}
        </StyledColumnTitle>
        {!!totalAmount && <StyledAmount>${totalAmount}</StyledAmount>}
      </StyledHeader>
      {children}
    </StyledColumn>
  );
}
