import styled from '@emotion/styled';

import { Button } from '@/ui/components/buttons/Button';

import { RightDrawerTopBarCloseButton } from './RightDrawerTopBarCloseButton';

const StyledRightDrawerTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: space-between;
  min-height: 40px;
  padding-left: 8px;
  padding-right: 8px;
`;

const StyledTopBarTitle = styled.div`
  align-items: center;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

export function RightDrawerTopBar({
  title,
  onClick,
}: {
  title: string | null | undefined;
  onClick?: () => void;
}) {
  function handleOnClick() {
    onClick?.();
  }
  return (
    <StyledRightDrawerTopBar>
      <RightDrawerTopBarCloseButton />
      <StyledTopBarTitle>{title}</StyledTopBarTitle>
      {onClick ? <Button title="Save" onClick={handleOnClick} /> : ''}
    </StyledRightDrawerTopBar>
  );
}
