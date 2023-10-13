import { FieldContext } from '@/ui/Data/Field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/Data/Field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/Data/Field/types/FieldMetadata';
import { InlineCell } from '@/ui/Data/Inline Cell/components/InlineCell';
import { InlineCellHotkeyScope } from '@/ui/Data/Inline Cell/types/InlineCellHotkeyScope';
import { IconUserCircle } from '@/ui/Display/Icon';
import { Entity } from '@/ui/Input/Relation Picker/types/EntityTypeForSelect';
import { Company, User, useUpdateActivityMutation } from '~/generated/graphql';

type ActivityAssigneeEditableFieldProps = {
  activity: Pick<Company, 'id' | 'accountOwnerId'> & {
    assignee?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
  };
};

export const ActivityAssigneeEditableField = ({
  activity,
}: ActivityAssigneeEditableFieldProps) => {
  return (
    <FieldContext.Provider
      value={{
        entityId: activity.id,
        recoilScopeId: 'assignee',
        fieldDefinition: {
          key: 'assignee',
          name: 'Assignee',
          Icon: IconUserCircle,
          type: 'relation',
          metadata: {
            fieldName: 'assignee',
            relationType: Entity.User,
          },
          entityChipDisplayMapper: (dataObject: User) => {
            return {
              name: dataObject?.displayName,
              pictureUrl: dataObject?.avatarUrl ?? undefined,
              avatarType: 'rounded',
            };
          },
        } satisfies FieldDefinition<FieldRelationMetadata>,
        useUpdateEntityMutation: useUpdateActivityMutation,
        hotkeyScope: InlineCellHotkeyScope.InlineCell,
      }}
    >
      <InlineCell />
    </FieldContext.Provider>
  );
};
