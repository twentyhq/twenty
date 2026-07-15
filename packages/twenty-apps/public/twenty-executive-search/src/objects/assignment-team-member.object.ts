import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  ASSIGNMENT_TEAM_MEMBER_ALLOCATED_PERCENTAGE_FIELD_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_JOINED_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_CONSULTANT,
  ASSIGNMENT_TEAM_MEMBER_ROLE_COORDINATOR,
  ASSIGNMENT_TEAM_MEMBER_ROLE_ENGAGEMENT_MANAGER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_CONSULTANT_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_COORDINATOR_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_ENGAGEMENT_MANAGER_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_PARTNER_LEAD_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_PRINCIPAL_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_RESEARCHER_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_PARTNER_LEAD,
  ASSIGNMENT_TEAM_MEMBER_ROLE_PRINCIPAL,
  ASSIGNMENT_TEAM_MEMBER_ROLE_RESEARCHER,
  ASSIGNMENT_TEAM_MEMBER_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TEAM_MEMBERS_ON_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  TEAM_MEMBERS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'assignmentTeamMember',
  namePlural: 'assignmentTeamMembers',
  labelSingular: 'Assignment Team Member',
  labelPlural: 'Assignment Team Members',
  description:
    'Links a workspace member to a search assignment with a specific role.',
  icon: 'IconUsers',
  // Junction-style — no labelIdentifierFieldMetadataUniversalIdentifier
  fields: [
    {
      universalIdentifier:
        ASSIGNMENT_TEAM_MEMBER_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'role',
      label: 'Role',
      description: 'The team member role on this search assignment.',
      icon: 'IconUser',
      options: [
        {
          id: ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_PARTNER_LEAD_UNIVERSAL_IDENTIFIER,
          value: ASSIGNMENT_TEAM_MEMBER_ROLE_PARTNER_LEAD,
          label: 'Partner Lead',
          color: 'orange',
          position: 0,
        },
        {
          id: ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_PRINCIPAL_UNIVERSAL_IDENTIFIER,
          value: ASSIGNMENT_TEAM_MEMBER_ROLE_PRINCIPAL,
          label: 'Principal',
          color: 'blue',
          position: 1,
        },
        {
          id: ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_ENGAGEMENT_MANAGER_UNIVERSAL_IDENTIFIER,
          value: ASSIGNMENT_TEAM_MEMBER_ROLE_ENGAGEMENT_MANAGER,
          label: 'Engagement Manager',
          color: 'green',
          position: 2,
        },
        {
          id: ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_RESEARCHER_UNIVERSAL_IDENTIFIER,
          value: ASSIGNMENT_TEAM_MEMBER_ROLE_RESEARCHER,
          label: 'Researcher',
          color: 'blue',
          position: 3,
        },
        {
          id: ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_COORDINATOR_UNIVERSAL_IDENTIFIER,
          value: ASSIGNMENT_TEAM_MEMBER_ROLE_COORDINATOR,
          label: 'Coordinator',
          color: 'yellow',
          position: 4,
        },
        {
          id: ASSIGNMENT_TEAM_MEMBER_ROLE_OPTION_CONSULTANT_UNIVERSAL_IDENTIFIER,
          value: ASSIGNMENT_TEAM_MEMBER_ROLE_CONSULTANT,
          label: 'Consultant',
          color: 'gray',
          position: 5,
        },
      ],
    },
    {
      universalIdentifier:
        ASSIGNMENT_TEAM_MEMBER_ALLOCATED_PERCENTAGE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'allocatedPercentage',
      label: 'Allocation %',
      description: 'Percentage of time allocated to this assignment.',
      icon: 'IconPercent',
      isNullable: true,
    },
    {
      universalIdentifier:
        ASSIGNMENT_TEAM_MEMBER_JOINED_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'joinedDate',
      label: 'Joined date',
      description: 'Date the team member joined the assignment.',
      icon: 'IconCalendarEvent',
      isNullable: true,
    },
    {
      universalIdentifier:
        ASSIGNMENT_TEAM_MEMBER_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isActive',
      label: 'Active',
      description: 'Whether the team member is currently active on this assignment.',
      defaultValue: true,
    },
    {
      universalIdentifier:
        ASSIGNMENT_TEAM_MEMBER_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'searchAssignment',
      label: 'Search assignment',
      description: 'The search assignment this member is part of.',
      icon: 'IconBriefcase',
      relationTargetObjectMetadataUniversalIdentifier:
        SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        TEAM_MEMBERS_ON_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'searchAssignmentId',
      },
    },
    {
      universalIdentifier:
        ASSIGNMENT_TEAM_MEMBER_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'workspaceMember',
      label: 'Workspace member',
      description: 'The workspace member assigned to this search.',
      icon: 'IconUser',
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        TEAM_MEMBERS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'workspaceMemberId',
      },
    },
  ],
});
