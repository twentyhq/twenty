import { useRef } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { ActivityType } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import {
  Checkbox,
  CheckboxShape,
  CheckboxSize,
} from '@/ui/input/components/Checkbox';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

const StyledEditableTitleInput = styled.input<{
  completed: boolean;
  value: string;
}>`
  background: transparent;

  border: none;
  color: ${({ theme, value }) =>
    value ? theme.font.color.primary : theme.font.color.light};
  display: flex;

  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};

  line-height: ${({ theme }) => theme.text.lineHeight.md};
  outline: none;
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
  width: calc(100% - ${({ theme }) => theme.spacing(2)});
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

type ActivityTitleProps = {
  title: string;
  type: ActivityType;
  completed: boolean;
  onTitleChange: (title: string) => void;
  onCompletionChange: (value: boolean) => void;
};

export const ActivityTitle = ({
  title,
  completed,
  type,
  onTitleChange,
  onCompletionChange,
}: ActivityTitleProps) => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useScopedHotkeys(
    Key.Escape,
    () => {
      titleInputRef.current?.blur();
    },
    ActivityEditorHotkeyScope.ActivityTitle,
  );

  const handleBlur = () => {
    goBackToPreviousHotkeyScope();
  };

  const handleFocus = () => {
    setHotkeyScopeAndMemorizePreviousScope(
      ActivityEditorHotkeyScope.ActivityTitle,
    );
  };

  return (
    <StyledContainer>
      {type === 'Task' && (
        <Checkbox
          size={CheckboxSize.Large}
          shape={CheckboxShape.Rounded}
          checked={completed}
          onCheckedChange={(value) => onCompletionChange(value)}
        />
      )}
      <StyledEditableTitleInput
        ref={titleInputRef}
        autoComplete="off"
        autoFocus
        placeholder={`${type} title`}
        onChange={(event) => onTitleChange(event.target.value)}
        value={title}
        completed={completed}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </StyledContainer>
  );
};
