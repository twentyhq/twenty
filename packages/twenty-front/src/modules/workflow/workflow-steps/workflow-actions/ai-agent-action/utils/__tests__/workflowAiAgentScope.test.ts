import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { getWorkflowAiAgentObjectPermissionsFromScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentObjectPermissionsFromScope';
import { getWorkflowAiAgentPermissionFlagKeysFromScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentPermissionFlagKeysFromScope';
import { grantWorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/grantWorkflowAiAgentObjectPermission';
import { revokeWorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/revokeWorkflowAiAgentObjectPermission';
import { setWorkflowAiAgentObjectPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/setWorkflowAiAgentObjectPermissionInScope';
import { setWorkflowAiAgentPermissionFlagKeysInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/setWorkflowAiAgentPermissionFlagKeysInScope';

const objectMetadataItems = [
  { id: 'person-id', universalIdentifier: 'person' },
  { id: 'company-id', universalIdentifier: 'company' },
];

describe('workflow AI agent scope', () => {
  it('reads the object permissions of a scope by object id', () => {
    expect(
      getWorkflowAiAgentObjectPermissionsFromScope({
        scope: {
          objectPermissions: [
            { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
            {
              objectUniversalIdentifier: 'unknown',
              canReadObjectRecords: true,
            },
          ],
        },
        objectMetadataItems,
      }),
    ).toEqual([
      {
        objectMetadataId: 'person-id',
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ]);
  });

  it('grants reading along with editing', () => {
    expect(
      grantWorkflowAiAgentObjectPermission({
        objectMetadataId: 'person-id',
        objectPermission: undefined,
        permissionKey: 'canUpdateObjectRecords',
      }),
    ).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canDestroyObjectRecords: false,
    });
  });

  it('revokes every action when reading is revoked', () => {
    expect(
      revokeWorkflowAiAgentObjectPermission({
        objectMetadataId: 'person-id',
        objectPermission: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
        permissionKey: 'canReadObjectRecords',
      }),
    ).toMatchObject({
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
    });
  });

  it('writes an object permission by universal identifier and drops it once empty', () => {
    const scope = setWorkflowAiAgentObjectPermissionInScope({
      scope: undefined,
      objectUniversalIdentifier: 'person',
      objectPermission: {
        objectMetadataId: 'person-id',
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    });

    expect(scope.objectPermissions).toEqual([
      {
        objectUniversalIdentifier: 'person',
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ]);

    expect(
      setWorkflowAiAgentObjectPermissionInScope({
        scope,
        objectUniversalIdentifier: 'person',
        objectPermission: {
          objectMetadataId: 'person-id',
          canReadObjectRecords: false,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        },
      }).objectPermissions,
    ).toEqual([]);
  });

  it('stores permission flags by universal identifier', () => {
    const scope = setWorkflowAiAgentPermissionFlagKeysInScope({
      scope: undefined,
      permissionFlagKeys: [PermissionFlagType.SEND_EMAIL_TOOL],
    });

    expect(scope.permissionFlagUniversalIdentifiers).toEqual([
      SystemPermissionFlag[PermissionFlagType.SEND_EMAIL_TOOL],
    ]);
    expect(getWorkflowAiAgentPermissionFlagKeysFromScope(scope)).toEqual([
      PermissionFlagType.SEND_EMAIL_TOOL,
    ]);
  });
});
