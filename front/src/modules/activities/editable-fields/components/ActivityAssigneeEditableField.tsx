import { InlineCell } from '@/ui/editable-field/components/InlineCell';
import { EditableFieldHotkeyScope } from '@/ui/editable-field/types/EditableFieldHotkeyScope';
import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/field/types/FieldMetadata';
import { IconUserCircle } from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { Company, User, useUpdateActivityMutation } from '~/generated/graphql';

type OwnProps = {
  activity: Pick<Company, 'id' | 'accountOwnerId'> & {
    assignee?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
  };
};

export const ActivityAssigneeEditableField = ({ activity }: OwnProps) => {
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
        } satisfies FieldDefinition<FieldRelationMetadata>,
        useUpdateEntityMutation: useUpdateActivityMutation,
        hotkeyScope: EditableFieldHotkeyScope.EditableField,
      }}
    >
      <InlineCell />
    </FieldContext.Provider>
  );
};
