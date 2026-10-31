import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { applyWorkflowAiAgentScopeObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/applyWorkflowAiAgentScopeObjectPermissionChange';
import { getWorkflowAiAgentScopePermissions } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentScopePermissions';

const objectMetadataItems = [
  { id: 'person-id', universalIdentifier: 'person', isSystem: false },
  { id: 'attachment-id', universalIdentifier: 'attachment', isSystem: true },
];

describe('workflow AI agent scope', () => {
  it('reads a scope as the permissions of all objects and of each known object', () => {
    expect(
      getWorkflowAiAgentScopePermissions({
        scope: {
          canReadAllObjectRecords: true,
          objectPermissions: [
            {
              objectUniversalIdentifier: 'person',
              canUpdateObjectRecords: true,
            },
            { objectUniversalIdentifier: 'attachment' },
            {
              objectUniversalIdentifier: 'unknown',
              canReadObjectRecords: true,
            },
          ],
          permissionFlagUniversalIdentifiers: [
            SystemPermissionFlag.SEND_EMAIL_TOOL,
          ],
        },
        objectMetadataItems,
      }),
    ).toEqual({
      objectPermissions: [
        {
          objectMetadataId: null,
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        },
        {
          objectMetadataId: 'person-id',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        },
        {
          objectMetadataId: 'attachment-id',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
        },
      ],
      permissionFlagKeys: [PermissionFlagType.SEND_EMAIL_TOOL],
    });
  });

  it('grants reading along with editing an object', () => {
    expect(
      applyWorkflowAiAgentScopeObjectPermissionChange({
        scope: undefined,
        objectUniversalIdentifier: 'person',
        permissionKey: 'canUpdateObjectRecords',
        value: true,
      }),
    ).toEqual({
      objectPermissions: [
        {
          objectUniversalIdentifier: 'person',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
    });
  });

  it('revokes every change when reading an object is revoked', () => {
    expect(
      applyWorkflowAiAgentScopeObjectPermissionChange({
        scope: {
          objectPermissions: [
            {
              objectUniversalIdentifier: 'person',
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
            },
          ],
        },
        objectUniversalIdentifier: 'person',
        permissionKey: 'canReadObjectRecords',
        value: false,
      }).objectPermissions,
    ).toEqual([
      {
        objectUniversalIdentifier: 'person',
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ]);
  });

  it('revokes every change on all objects when reading all objects is revoked', () => {
    expect(
      applyWorkflowAiAgentScopeObjectPermissionChange({
        scope: {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          permissionFlagUniversalIdentifiers: [],
        },
        objectUniversalIdentifier: null,
        permissionKey: 'canReadObjectRecords',
        value: false,
      }),
    ).toEqual({
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      permissionFlagUniversalIdentifiers: [],
    });
  });
});
