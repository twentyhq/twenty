import styled from '@emotion/styled';
import { IconChevronRight, Label } from 'twenty-ui/display';

export const StyledText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const StyledLabel = styled(Label)`
  margin: ${({ theme }) => theme.spacing(3, 3, 0)};
`;

export const StyledRow = styled.div<{ isDisabled?: boolean }>`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1)};
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.spacing(1)};
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};

  :hover {
    background-color: ${({ theme, isDisabled }) =>
      isDisabled ? 'inherit' : theme.background.transparent.light};
  }

  :hover [data-delete-button] {
    opacity: 1;
  }
`;

export const StyledDeleteButton = styled.div`
  opacity: 0;
  transition: opacity ${({ theme }) => theme.animation.duration.fast}ms;
`;

export const StyledRowLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const StyledIconContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;
