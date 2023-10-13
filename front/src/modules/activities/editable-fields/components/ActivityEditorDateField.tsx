import { FieldContext } from '@/ui/Data/Field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/Data/Field/types/FieldDefinition';
import { FieldDateMetadata } from '@/ui/Data/Field/types/FieldMetadata';
import { InlineCell } from '@/ui/Data/Inline Cell/components/InlineCell';
import { InlineCellHotkeyScope } from '@/ui/Data/Inline Cell/types/InlineCellHotkeyScope';
import { IconCalendar } from '@/ui/Display/Icon/index';
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
