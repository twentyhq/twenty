import { useContext } from 'react';
import { Key } from 'ts-key-enum';
import { IconArrowUpRight, IconPencil } from 'twenty-ui';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { Activity } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

type ActivityTargetsInlineCellProps = {
  activity: Activity;
  showLabel?: boolean;
  maxWidth?: number;
  readonly?: boolean;
};

export const ActivityTargetsInlineCell = ({
  activity,
  showLabel = true,
  maxWidth,
  readonly,
}: ActivityTargetsInlineCellProps) => {
  const { activityTargetObjectRecords } =
    useActivityTargetObjectRecords(activity);
  const { closeInlineCell } = useInlineCell();

  const { fieldDefinition } = useContext(FieldContext);

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeInlineCell();
    },
    ActivityEditorHotkeyScope.ActivityTargets,
  );

  return (
    <RecordFieldInputScope recordFieldInputScopeId={activity?.id ?? ''}>
      <FieldFocusContextProvider>
        <RecordInlineCellContainer
          buttonIcon={IconPencil}
          customEditHotkeyScope={{
            scope: ActivityEditorHotkeyScope.ActivityTargets,
          }}
          IconLabel={showLabel ? IconArrowUpRight : undefined}
          showLabel={showLabel}
          readonly={readonly}
          labelWidth={fieldDefinition?.labelWidth}
          editModeContent={
            <ActivityTargetInlineCellEditMode
              activity={activity}
              activityTargetWithTargetRecords={activityTargetObjectRecords}
            />
          }
          label="Relations"
          displayModeContent={
            <ActivityTargetChips
              activityTargetObjectRecords={activityTargetObjectRecords}
              maxWidth={maxWidth}
            />
          }
          isDisplayModeContentEmpty={activityTargetObjectRecords.length === 0}
        />
      </FieldFocusContextProvider>
    </RecordFieldInputScope>
  );
};
