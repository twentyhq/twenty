import { FieldContext } from '@/ui/data/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/data/field/types/FieldDefinition';
import { FieldDateMetadata } from '@/ui/data/field/types/FieldMetadata';
import { InlineCell } from '@/ui/data/inline-cell/components/InlineCell';
import { InlineCellHotkeyScope } from '@/ui/data/inline-cell/types/InlineCellHotkeyScope';
import { IconCalendar } from '@/ui/display/icon/index';
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
            key: 'activityDueAt',
            name: 'Due date',
            Icon: IconCalendar,
            type: 'date',
            metadata: {
              fieldName: 'dueAt',
            },
          } satisfies FieldDefinition<FieldDateMetadata>,
          useUpdateEntityMutation: useUpdateActivityMutation,
          hotkeyScope: InlineCellHotkeyScope.InlineCell,
        }}
      >
        <InlineCell />
      </FieldContext.Provider>
    </RecoilScope>
  );
};
