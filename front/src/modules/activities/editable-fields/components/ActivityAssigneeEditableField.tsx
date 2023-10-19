import { FieldContext } from '@/ui/data/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/data/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/data/field/types/FieldMetadata';
import { InlineCell } from '@/ui/data/inline-cell/components/InlineCell';
import { InlineCellHotkeyScope } from '@/ui/data/inline-cell/types/InlineCellHotkeyScope';
import { IconUserCircle } from '@/ui/display/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import {
  Company,
  User,
  useUpdateActivityMutation,
  WorkspaceMember,
} from '~/generated/graphql';

type ActivityAssigneeEditableFieldProps = {
  activity: Pick<Company, 'id' | 'accountOwnerId'> & {
    assignee?: {
      user?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
    } | null;
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
            relationType: Entity.WorkspaceMember,
          },
          entityChipDisplayMapper: (dataObject: WorkspaceMember) => {
            return {
              name: dataObject?.user?.displayName,
              pictureUrl: dataObject?.user.avatarUrl ?? undefined,
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
