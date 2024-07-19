import { useContext } from 'react';
import { Key } from 'ts-key-enum';
import { IconArrowUpRight, IconPencil } from 'twenty-ui';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { Activity } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
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

  const { FieldContextProvider: ActivityTargetsContextProvider } =
    useFieldContext({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecordId: activity.id,
      fieldMetadataName: 'activityTargets',
      fieldPosition: 3,
      overridenIsFieldEmpty: activityTargetObjectRecords.length === 0,
    });

  return (
    <RecordFieldInputScope recordFieldInputScopeId={activity?.id ?? ''}>
      <FieldFocusContextProvider>
        {ActivityTargetsContextProvider && (
          <ActivityTargetsContextProvider>
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
            />
          </ActivityTargetsContextProvider>
        )}
      </FieldFocusContextProvider>
    </RecordFieldInputScope>
  );
};
