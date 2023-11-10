import { IconCalendar } from '@/ui/display/icon/index';
import { FieldContext } from '@/ui/object/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldDateMetadata } from '@/ui/object/field/types/FieldMetadata';
import { RecordInlineCell } from '@/ui/object/record-inline-cell/components/RecordInlineCell';
import { InlineCellHotkeyScope } from '@/ui/object/record-inline-cell/types/InlineCellHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useUpdateActivityMutation } from '~/generated/graphql';

type ActivityEditorDateFieldProps = {
  activityId: string;
};

export const ActivityEditorDateField = ({
  activityId,
}: ActivityEditorDateFieldProps) => {
  return (
    <RecoilScope>
      <FieldContext.Provider
        value={{
          entityId: activityId,
          recoilScopeId: 'activityDueAt',
          fieldDefinition: {
            fieldId: 'activityDueAt',
            label: 'Due date',
            Icon: IconCalendar,
            type: 'DATE',
            metadata: {
              fieldName: 'dueAt',
            },
          } satisfies FieldDefinition<FieldDateMetadata>,
          useUpdateEntityMutation: useUpdateActivityMutation,
          hotkeyScope: InlineCellHotkeyScope.InlineCell,
        }}
      >
        <RecordInlineCell />
      </FieldContext.Provider>
    </RecoilScope>
  );
};
