import { useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { activityTitleFamilyState } from '@/activities/states/activityTitleFamilyState';
import { activityTitleHasBeenSetFamilyState } from '@/activities/states/activityTitleHasBeenSetFamilyState';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { Activity } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
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
  activityId: string;
};

export const ActivityTitle = ({ activityId }: ActivityTitleProps) => {
  const [activityInStore, setActivityInStore] = useRecoilState(
    recordStoreFamilyState(activityId),
  );

  const cache = useApolloClient().cache;

  const [activityTitle, setActivityTitle] = useRecoilState(
    activityTitleFamilyState({ activityId }),
  );

  const activity = activityInStore as Activity;

  const [canCreateActivity, setCanCreateActivity] = useRecoilState(
    canCreateActivityState,
  );

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
      activityId: activityId,
    }),
  );

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Activity,
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

  const setTitleDebounced = useDebouncedCallback((newTitle: string) => {
    setActivityInStore((currentActivity) => {
      return {
        ...currentActivity,
        id: activity.id,
        title: newTitle,
      };
    });

    if (isNonEmptyString(newTitle) && !canCreateActivity) {
      setCanCreateActivity(true);
    }

    modifyRecordFromCache({
      recordId: activity.id,
      fieldModifiers: {
        title: () => {
          return newTitle;
        },
      },
      cache: cache,
      objectMetadataItem: objectMetadataItemActivity,
    });
  }, 0);

  const handleTitleChange = (newTitle: string) => {
    setActivityTitle(newTitle);

    setTitleDebounced(newTitle);

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
        value={activityTitle}
        completed={completed}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </StyledContainer>
  );
};
