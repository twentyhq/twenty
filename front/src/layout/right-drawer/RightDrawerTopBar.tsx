import styled from '@emotion/styled';
import { RightDrawerTopBarCloseButton } from './RightDrawerTopBarCloseButton';

const StyledRightDrawerTopBar = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  align-items: center;
  justify-content: space-between;
  padding-left: 8px;
  padding-right: 8px;
  font-size: 13px;
  color: ${(props) => props.theme.text60};
  border-bottom: 1px solid ${(props) => props.theme.lightBorder};
`;

const StyledTopBarTitle = styled.div`
  align-items: center;
  font-weight: 500;
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
