import styled from '@emotion/styled';

import { RightDrawerTopBarCloseButton } from './RightDrawerTopBarCloseButton';

const StyledRightDrawerTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.lightBorder};
  color: ${(props) => props.theme.text60};
  display: flex;
  flex-direction: row;
  font-size: 13px;
  justify-content: space-between;
  min-height: 40px;
  padding-left: 8px;
  padding-right: 8px;
`;

const StyledTopBarTitle = styled.div`
  align-items: center;
  font-weight: 500;
  margin-right: ${(props) => props.theme.spacing(1)};
`;

export function RightDrawerTopBar({
  title,
}: {
  title: string | null | undefined;
}) {
  return (
    <StyledRightDrawerTopBar>
      <StyledTopBarTitle>{title}</StyledTopBarTitle>
      <RightDrawerTopBarCloseButton />
    </StyledRightDrawerTopBar>
  );
}
