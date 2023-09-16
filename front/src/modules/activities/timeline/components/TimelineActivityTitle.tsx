import styled from '@emotion/styled';

import { Checkbox, CheckboxShape } from '@/ui/input/components/Checkbox';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';
import { ActivityType } from '~/generated/graphql';

const StyledTitleContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};

  width: 100%;
`;

const StyledTitleText = styled.div<{
  completed?: boolean;
  hasCheckbox?: boolean;
}>`
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  width: ${({ hasCheckbox, theme }) =>
    !hasCheckbox ? '100%;' : `calc(100% - ${theme.spacing(5)});`};
`;

const StyledCheckboxContainer = styled.div<{ hasCheckbox?: boolean }>`
  align-items: center;
  display: flex;
  justify-content: center;
`;

type OwnProps = {
  title: string;
  completed?: boolean;
  type: ActivityType;
  onCompletionChange?: (value: boolean) => void;
};

export const TimelineActivityTitle = ({
  title,
  completed,
  type,
  onCompletionChange,
}: OwnProps) => (
  <StyledTitleContainer>
    {type === ActivityType.Task && (
      <StyledCheckboxContainer
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onCompletionChange?.(!completed);
        }}
      >
        <Checkbox checked={completed ?? false} shape={CheckboxShape.Rounded} />
      </StyledCheckboxContainer>
    )}
    <StyledTitleText
      completed={completed}
      hasCheckbox={type === ActivityType.Task}
    >
      <OverflowingTextWithTooltip text={title ? title : 'Task title'} />
    </StyledTitleText>
  </StyledTitleContainer>
);
