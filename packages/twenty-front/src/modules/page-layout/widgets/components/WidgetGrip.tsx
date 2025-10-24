import styled from '@emotion/styled';
import { IconGripVertical } from 'twenty-ui/display';

const StyledGripContainer = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;

  &:active {
    cursor: grabbing;
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  svg {
    width: ${({ theme }) => theme.icon.size.sm};
    height: ${({ theme }) => theme.icon.size.sm};
    color: ${({ theme }) => theme.font.color.extraLight};
  }
`;

type WidgetGripProps = {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export const WidgetGrip = ({ className, onClick }: WidgetGripProps) => {
  return (
    <StyledGripContainer className={className} onClick={onClick}>
      <IconGripVertical />
    </StyledGripContainer>
  );
};
