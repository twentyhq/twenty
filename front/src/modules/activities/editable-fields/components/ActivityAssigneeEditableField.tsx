import React, { useMemo } from 'react';

import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { IconUserCircle } from '@/ui/display/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { FieldContext } from '@/ui/object/field/contexts/FieldContext';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/object/field/types/FieldMetadata';
import { RecordInlineCell } from '@/ui/object/record-inline-cell/components/RecordInlineCell';
import { InlineCellHotkeyScope } from '@/ui/object/record-inline-cell/types/InlineCellHotkeyScope';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { Company, User } from '~/generated/graphql';

type ActivityAssigneeEditableFieldProps = {
  activity: Pick<Company, 'id' | 'accountOwnerId'> & {
    assignee?: Pick<
      WorkspaceMember,
      'id' | 'firstName' | 'lastName' | 'avatarUrl'
    > | null;
  };
};

export const ActivityAssigneeEditableField = ({
  activity,
}: ActivityAssigneeEditableFieldProps) => {
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
  const value = useMemo(
    () => ({
      entityId: activity.id,
      recoilScopeId: 'assignee',
      fieldDefinition: {
        fieldMetadataId: 'assignee',
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
      useUpdateEntityMutation: useUpdateOneObjectMutation,
      hotkeyScope: InlineCellHotkeyScope.InlineCell,
    }),
    [activity.id],
  );

  return (
    <FieldContext.Provider value={value}>
      <RecordInlineCell />
    </FieldContext.Provider>
  );
};
