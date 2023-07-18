import React, { ChangeEvent } from 'react';
import styled from '@emotion/styled';

import { debounce } from '@/utils/debounce';

import { EditColumnTitleInput } from './EditColumnTitleInput';

export const StyledColumn = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  min-width: 200px;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeader = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export const StyledColumnTitle = styled.h3`
  align-items: center;
  color: ${({ color }) => color};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  height: 24px;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledAmount = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

type OwnProps = {
  colorCode?: string;
  title: string;
  pipelineStageId?: string;
  onTitleEdit: (title: string) => void;
  totalAmount?: number;
  children: React.ReactNode;
};

export function BoardColumn({
  colorCode,
  title,
  onTitleEdit,
  totalAmount,
  children,
}: OwnProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(title);

  const debouncedOnUpdate = debounce(onTitleEdit, 200);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value);
    debouncedOnUpdate(event.target.value);
  };

  return (
    <StyledColumn>
      <StyledHeader onClick={() => setIsEditing(true)}>
        <StyledColumnTitle color={colorCode}>
          •
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
