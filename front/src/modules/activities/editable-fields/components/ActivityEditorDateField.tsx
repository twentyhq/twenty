import { InlineCell } from '@/ui/editable-field/components/InlineCell';
import { EditableFieldHotkeyScope } from '@/ui/editable-field/types/EditableFieldHotkeyScope';
import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import { FieldDateMetadata } from '@/ui/field/types/FieldMetadata';
import { IconCalendar } from '@/ui/icon/index';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useUpdateActivityMutation } from '~/generated/graphql';

type OwnProps = {
  activityId: string;
};

export const ActivityEditorDateField = ({ activityId }: OwnProps) => {
  return (
    <RecoilScope>
      <FieldContext.Provider
        value={{
          entityId: activityId,
          recoilScopeId: 'activityDueAt',
          fieldDefinition: {
            key: 'activityDueAt',
            name: 'Due date',
            Icon: IconCalendar,
            type: 'date',
            metadata: {
              fieldName: 'dueAt',
            },
          } satisfies FieldDefinition<FieldDateMetadata>,
          useUpdateEntityMutation: useUpdateActivityMutation,
          hotkeyScope: EditableFieldHotkeyScope.EditableField,
        }}
      >
        <InlineCell />
      </FieldContext.Provider>
    </RecoilScope>
  );
};
