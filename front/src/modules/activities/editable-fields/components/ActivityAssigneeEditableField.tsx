import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/field/types/FieldMetadata';
import { IconUserCircle } from '@/ui/icon';
import { InlineCell } from '@/ui/inline-cell/components/InlineCell';
import { InlineCellHotkeyScope } from '@/ui/inline-cell/types/InlineCellHotkeyScope';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
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
        } satisfies FieldDefinition<FieldRelationMetadata>,
        useUpdateEntityMutation: useUpdateActivityMutation,
        hotkeyScope: InlineCellHotkeyScope.InlineCell,
      }}
    >
      <InlineCell />
    </FieldContext.Provider>
  );
};
