import React, { useMemo } from 'react';

import { IconUserCircle } from '@/ui/display/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { FieldContext } from '@/ui/object/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/object/field/types/FieldMetadata';
import { InlineCell } from '@/ui/object/record-inline-cell/components/InlineCell';
import { InlineCellHotkeyScope } from '@/ui/object/record-inline-cell/types/InlineCellHotkeyScope';
import { Company, User, useUpdateActivityMutation } from '~/generated/graphql';

type ActivityAssigneeEditableFieldProps = {
  activity: Pick<Company, 'id' | 'accountOwnerId'> & {
    assignee?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
  };
};

export const ActivityAssigneeEditableField = ({
  activity,
}: ActivityAssigneeEditableFieldProps) => {
  const value = useMemo(
    () => ({
      entityId: activity.id,
      recoilScopeId: 'assignee',
      fieldDefinition: {
        fieldId: 'assignee',
        label: 'Assignee',
        Icon: IconUserCircle,
        type: 'RELATION',
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
    }),
    [activity.id],
  );

  return (
    <FieldContext.Provider value={value}>
      <InlineCell />
    </FieldContext.Provider>
  );
};
