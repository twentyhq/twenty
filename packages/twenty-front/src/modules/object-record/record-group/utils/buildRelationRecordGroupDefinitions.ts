import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

const NO_VALUE_RECORD_GROUP_ID_SUFFIX = 'no-value';

const getWorkspaceMemberName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string => `${firstName ?? ''} ${lastName ?? ''}`.trim();

export const buildRelationRecordGroupDefinitions = ({
  groupValues,
  mainGroupByFieldMetadataId,
  workspaceMembers,
}: {
  groupValues: (string | null)[];
  mainGroupByFieldMetadataId: string;
  workspaceMembers: PartialWorkspaceMember[];
}): RecordGroupDefinition[] => {
  const presentAssigneeIds: string[] = [];
  let hasNoAssigneeGroup = false;

  for (const groupValue of groupValues) {
    if (isDefined(groupValue)) {
      if (!presentAssigneeIds.includes(groupValue)) {
        presentAssigneeIds.push(groupValue);
      }
    } else {
      hasNoAssigneeGroup = true;
    }
  }

  const memberGroupDefinitions: RecordGroupDefinition[] = presentAssigneeIds
    .map((assigneeId) => {
      const workspaceMember = workspaceMembers.find(
        (member) => member.id === assigneeId,
      );

      const title = isDefined(workspaceMember)
        ? getWorkspaceMemberName(
            workspaceMember.name.firstName,
            workspaceMember.name.lastName,
          )
        : '';

      return {
        id: assigneeId,
        type: RecordGroupDefinitionType.Value,
        title: title.length > 0 ? title : assigneeId,
        value: assigneeId,
        color: 'transparent' as const,
        isVisible: true,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((groupDefinition, index) => ({
      ...groupDefinition,
      position: index,
    }));

  if (!hasNoAssigneeGroup) {
    return memberGroupDefinitions;
  }

  return [
    ...memberGroupDefinitions,
    {
      id: `${mainGroupByFieldMetadataId}-${NO_VALUE_RECORD_GROUP_ID_SUFFIX}`,
      type: RecordGroupDefinitionType.NoValue,
      title: 'No assignee',
      value: null,
      color: 'transparent',
      position: memberGroupDefinitions.length,
      isVisible: true,
    },
  ];
};
