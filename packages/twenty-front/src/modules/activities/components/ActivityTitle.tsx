import { useRef } from 'react';
import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { activityTitleHasBeenSetFamilyState } from '@/activities/states/activityTitleHasBeenSetFamilyState';
import { Activity } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';
import {
  Checkbox,
  CheckboxShape,
  CheckboxSize,
} from '@/ui/input/components/Checkbox';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from '~/utils/isDefined';

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
  activity: Activity;
};

export const ActivityTitle = ({ activity }: ActivityTitleProps) => {
  const [internalTitle, setInternalTitle] = useState(activity.title);

  const { upsertActivity } = useUpsertActivity();

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useScopedHotkeys(
    Key.Escape,
    () => {
      handleBlur();
    },
    ActivityEditorHotkeyScope.ActivityTitle,
  );

  const handleBlur = () => {
    goBackToPreviousHotkeyScope();
    titleInputRef.current?.blur();
  };

  const handleFocus = () => {
    setHotkeyScopeAndMemorizePreviousScope(
      ActivityEditorHotkeyScope.ActivityTitle,
    );
  };

  const [activityTitleHasBeenSet, setActivityTitleHasBeenSet] = useRecoilState(
    activityTitleHasBeenSetFamilyState({
      activityId: activity.id,
    }),
  );

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const modifyActivityFromCache = useModifyRecordFromCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const persistTitleDebounced = useDebouncedCallback((newTitle: string) => {
    upsertActivity({
      activity,
      input: {
        title: newTitle,
      },
    });

    if (!activityTitleHasBeenSet) {
      setActivityTitleHasBeenSet(true);
    }
  }, 500);

  const handleTitleChange = (newTitle: string) => {
    setInternalTitle(newTitle);

    modifyActivityFromCache(activity.id, {
      title: () => {
        return newTitle;
      },
    });

    persistTitleDebounced(newTitle);
  };

  const handleActivityCompletionChange = (value: boolean) => {
    upsertActivity({
      activity,
      input: {
        completedAt: value ? new Date().toISOString() : null,
      },
    });
  };

  const completed = isDefined(activity.completedAt);

  return (
    <StyledContainer>
      {activity.type === 'Task' && (
        <Checkbox
          size={CheckboxSize.Large}
          shape={CheckboxShape.Rounded}
          checked={completed}
          onCheckedChange={(value) => handleActivityCompletionChange(value)}
        />
      )}
      <StyledEditableTitleInput
        autoComplete="off"
        autoFocus
        ref={titleInputRef}
        placeholder={`${activity.type} title`}
        onChange={(event) => handleTitleChange(event.target.value)}
        value={internalTitle}
        completed={completed}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </StyledContainer>
  );
};
