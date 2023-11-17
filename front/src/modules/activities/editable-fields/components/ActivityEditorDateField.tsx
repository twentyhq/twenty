import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { IconCalendar } from '@/ui/display/icon/index';
import { FieldContext } from '@/ui/object/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldDateMetadata } from '@/ui/object/field/types/FieldMetadata';
import { RecordInlineCell } from '@/ui/object/record-inline-cell/components/RecordInlineCell';
import { InlineCellHotkeyScope } from '@/ui/object/record-inline-cell/types/InlineCellHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

type ActivityEditorDateFieldProps = {
  activityId: string;
};

export const ActivityEditorDateField = ({
  activityId,
}: ActivityEditorDateFieldProps) => {
  const useUpdateOneObjectMutation: () => [(params: any) => any, any] = () => {
    const { updateOneObject } = useUpdateOneObjectRecord({
      objectNameSingular: 'activityV2',
    });

    const updateEntity = ({
      variables,
    }: {
      variables: {
        where: { id: string };
        data: {
          [fieldName: string]: any;
        };
      };
    }) => {
      updateOneObject?.({
        idToUpdate: variables.where.id,
        input: variables.data,
      });
    };

    return [updateEntity, { loading: false }];
  };

  return (
    <RecoilScope>
      <FieldContext.Provider
        value={{
          entityId: activityId,
          recoilScopeId: 'activityDueAt',
          fieldDefinition: {
            fieldMetadataId: 'activityDueAt',
            label: 'Due date',
            Icon: IconCalendar,
            type: 'DATE',
            metadata: {
              fieldName: 'dueAt',
            },
          } satisfies FieldDefinition<FieldDateMetadata>,
          useUpdateEntityMutation: useUpdateOneObjectMutation,
          hotkeyScope: InlineCellHotkeyScope.InlineCell,
        }}
      >
        <RecordInlineCell />
      </FieldContext.Provider>
    </RecoilScope>
  );
};
