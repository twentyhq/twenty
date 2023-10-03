import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import { FieldDateMetadata } from '@/ui/field/types/FieldMetadata';
import { IconCalendar } from '@/ui/icon/index';
import { InlineCell } from '@/ui/inline-cell/components/InlineCell';
import { InlineCellHotkeyScope } from '@/ui/inline-cell/types/InlineCellHotkeyScope';
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
          hotkeyScope: InlineCellHotkeyScope.InlineCell,
        }}
      >
        <InlineCell />
      </FieldContext.Provider>
    </RecoilScope>
  );
};
