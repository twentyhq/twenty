import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  viewName: string;
  viewIcon?: ReactNode;
};

const StyledTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${(props) => props.theme.spacing(8)};
  font-weight: 500;
  padding-left: ${(props) => props.theme.spacing(2)};
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing(1)};
`;

export function ColumnHead({ viewName, viewIcon }: OwnProps) {
  return (
    <StyledTitle>
      <StyledIcon>{viewIcon}</StyledIcon>
      {viewName}
    </StyledTitle>
  );
}
