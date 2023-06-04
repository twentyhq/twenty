import React from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { selectedRowIdsState } from '@/ui/tables/states/selectedRowIdsState';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

const StyledContainer = styled.div`
  display: flex;
  position: absolute;
  z-index: 1;
  height: 48px;
  bottom: 38px;
  background: ${(props) => props.theme.secondaryBackground};
  align-items: center;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  left: 50%;
  transform: translateX(-50%);

  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.primaryBorder};
`;

export function EntityTableActionBar({ children }: OwnProps) {
  const selectedRowIds = useRecoilValue(selectedRowIdsState);

  if (selectedRowIds.length === 0) {
    return <></>;
  }

  return <StyledContainer>{children}</StyledContainer>;
}
