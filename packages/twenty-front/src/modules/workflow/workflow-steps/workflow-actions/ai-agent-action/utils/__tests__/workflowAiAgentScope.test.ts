import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { getWorkflowAiAgentObjectPermissionsFromScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentObjectPermissionsFromScope';
import { getWorkflowAiAgentPermissionFlagKeysFromScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentPermissionFlagKeysFromScope';
import { grantWorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/grantWorkflowAiAgentObjectPermission';
import { revokeWorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/revokeWorkflowAiAgentObjectPermission';
import { grantWorkflowAiAgentObjectPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/grantWorkflowAiAgentObjectPermissionInScope';
import { revokeWorkflowAiAgentObjectPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/revokeWorkflowAiAgentObjectPermissionInScope';
import { revokeWorkflowAiAgentAllObjectsPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/revokeWorkflowAiAgentAllObjectsPermissionInScope';
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

  it('writes a granted action by universal identifier and drops the entry once empty', () => {
    const scope = grantWorkflowAiAgentObjectPermissionInScope({
      scope: undefined,
      objectUniversalIdentifier: 'person',
      permissionKey: 'canReadObjectRecords',
    });

    expect(scope.objectPermissions).toEqual([
      { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
    ]);

    expect(
      revokeWorkflowAiAgentObjectPermissionInScope({
        scope,
        objectUniversalIdentifier: 'person',
        permissionKey: 'canReadObjectRecords',
      }).objectPermissions,
    ).toEqual([]);
  });

  it('grants reading along with editing, so editing never goes without it', () => {
    expect(
      grantWorkflowAiAgentObjectPermissionInScope({
        scope: undefined,
        objectUniversalIdentifier: 'person',
        permissionKey: 'canUpdateObjectRecords',
      }).objectPermissions,
    ).toEqual([
      {
        objectUniversalIdentifier: 'person',
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
      },
    ]);
  });

  it('keeps an all-objects grant effective on an object when another action is granted on it', () => {
    const scope = grantWorkflowAiAgentObjectPermissionInScope({
      scope: { canUpdateAllObjectRecords: true },
      objectUniversalIdentifier: 'person',
      permissionKey: 'canReadObjectRecords',
    });

    expect(scope.objectPermissions).toEqual([
      { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
    ]);
    expect(
      getWorkflowAiAgentObjectPermissionsFromScope({
        scope,
        objectMetadataItems,
      }),
    ).toEqual([
      expect.objectContaining({
        objectMetadataId: 'person-id',
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
      }),
    ]);
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

  it('stores an explicit denial for a removed action an all-objects grant would otherwise cover', () => {
    expect(
      revokeWorkflowAiAgentObjectPermissionInScope({
        scope: {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          objectPermissions: [
            {
              objectUniversalIdentifier: 'person',
              canUpdateObjectRecords: true,
            },
          ],
        },
        objectUniversalIdentifier: 'person',
        permissionKey: 'canUpdateObjectRecords',
      }).objectPermissions,
    ).toEqual([
      { objectUniversalIdentifier: 'person', canUpdateObjectRecords: false },
    ]);
  });

  it('denies every covered action when reading is removed under all-objects grants', () => {
    expect(
      revokeWorkflowAiAgentObjectPermissionInScope({
        scope: {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
        },
        objectUniversalIdentifier: 'person',
        permissionKey: 'canReadObjectRecords',
      }).objectPermissions,
    ).toEqual([
      {
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        objectUniversalIdentifier: 'person',
      },
    ]);
  });

  it('revokes every all-objects action when reading all objects is revoked', () => {
    expect(
      revokeWorkflowAiAgentAllObjectsPermissionInScope({
        scope: {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
        },
        permissionKey: 'canReadObjectRecords',
      }),
    ).toMatchObject({
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
    });
    expect(
      revokeWorkflowAiAgentAllObjectsPermissionInScope({
        scope: {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
        },
        permissionKey: 'canUpdateObjectRecords',
      }),
    ).toMatchObject({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
    });
  });

  it('keeps an action granted under all-objects reading, with its reading, once that reading is revoked', () => {
    const scope = revokeWorkflowAiAgentAllObjectsPermissionInScope({
      scope: grantWorkflowAiAgentObjectPermissionInScope({
        scope: { canReadAllObjectRecords: true },
        objectUniversalIdentifier: 'person',
        permissionKey: 'canUpdateObjectRecords',
      }),
      permissionKey: 'canReadObjectRecords',
    });

    expect(
      getWorkflowAiAgentObjectPermissionsFromScope({
        scope,
        objectMetadataItems,
      }),
    ).toEqual([
      expect.objectContaining({
        objectMetadataId: 'person-id',
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
      }),
    ]);
  });

  it('restores reading on an entry that only relied on all-objects reading', () => {
    expect(
      revokeWorkflowAiAgentAllObjectsPermissionInScope({
        scope: {
          canReadAllObjectRecords: true,
          objectPermissions: [
            {
              objectUniversalIdentifier: 'person',
              canUpdateObjectRecords: true,
            },
          ],
        },
        permissionKey: 'canReadObjectRecords',
      }).objectPermissions,
    ).toEqual([
      {
        objectUniversalIdentifier: 'person',
        canUpdateObjectRecords: true,
        canReadObjectRecords: true,
      },
    ]);
  });
});
