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

const StyledTitleText = styled.div<{ completed?: boolean }>`
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  width: 100%;
`;

const StyledCheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

type OwnProps = {
  title: string;
  completed?: boolean;
  type: ActivityType;
  onCompletionChange?: (value: boolean) => void;
};

export function TimelineActivityTitle({
  title,
  completed,
  type,
  onCompletionChange,
}: OwnProps) {
  return (
    <StyledTitleContainer>
      {type === ActivityType.Task && (
        <StyledCheckboxContainer
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onCompletionChange?.(!completed);
          }}
        >
          <Checkbox
            checked={completed ?? false}
            shape={CheckboxShape.Rounded}
          />
        </StyledCheckboxContainer>
      )}
      <StyledTitleText completed={completed}>
        <OverflowingTextWithTooltip text={title ? title : '(No title)'} />
      </StyledTitleText>
    </StyledTitleContainer>
  );
}
