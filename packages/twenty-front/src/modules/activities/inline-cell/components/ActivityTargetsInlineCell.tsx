import { Key } from 'ts-key-enum';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { Activity } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { IconArrowUpRight, IconPencil } from '@/ui/display/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

type ActivityTargetsInlineCellProps = {
  onFocus?: () => void;
  onBlur?: () => void;
  activity: Activity;
};

export const ActivityTargetsInlineCell = ({
  activity,
  onFocus,
  onBlur,
}: ActivityTargetsInlineCellProps) => {
  const { activityTargetObjectRecords } = useActivityTargetObjectRecords({
    activityId: activity?.id ?? '',
  });
  const { closeInlineCell } = useInlineCell();

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeInlineCell();
    },
    ActivityEditorHotkeyScope.ActivityTargets,
  );

  const { FieldContextProvider } = useFieldContext({
    objectNameSingular: CoreObjectNameSingular.Activity,
    objectRecordId: activity?.id ?? '',
    fieldMetadataName: 'activityTargets',
    fieldPosition: 2,
  });

  if (!FieldContextProvider) return null;

  return (
    <RecordFieldInputScope recordFieldInputScopeId={activity?.id ?? ''}>
      <FieldContextProvider>
        <RecordInlineCellContainer
          buttonIcon={IconPencil}
          customEditHotkeyScope={{
            scope: ActivityEditorHotkeyScope.ActivityTargets,
          }}
          IconLabel={IconArrowUpRight}
          editModeContent={
            <ActivityTargetInlineCellEditMode
              activity={activity}
              activityTargetObjectRecords={activityTargetObjectRecords}
              onBlur={onBlur}
            />
          }
          label="Relations"
          displayModeContent={
            <ActivityTargetChips
              activityTargetObjectRecords={activityTargetObjectRecords}
            />
          }
          isDisplayModeContentEmpty={activityTargetObjectRecords.length === 0}
          onInlineCellClick={onFocus}
        />
      </FieldContextProvider>
    </RecordFieldInputScope>
  );
};
