import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  viewName: string;
  viewIcon?: ReactNode;
};

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function ColumnHead({ viewName, viewIcon }: OwnProps) {
  return (
    <StyledTitle>
      <StyledIcon>{viewIcon}</StyledIcon>
      <StyledText>{viewName}</StyledText>
    </StyledTitle>
  );
}
