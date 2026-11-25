import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { applyWorkflowAiAgentScopeObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/applyWorkflowAiAgentScopeObjectPermissionChange';
import { applyWorkflowAiAgentScopePermissionFlagChangeOrThrow } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/applyWorkflowAiAgentScopePermissionFlagChangeOrThrow';
import { getWorkflowAiAgentScopePermissions } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentScopePermissions';

const objectMetadataItems = [
  { id: 'person-id', universalIdentifier: 'person', labelPlural: 'People' },
  {
    id: 'company-id',
    universalIdentifier: 'company',
    labelPlural: 'Companies',
  },
];

describe('workflow AI agent scope', () => {
  it('reads a scope as written, without inheriting from all objects', () => {
    expect(
      getWorkflowAiAgentScopePermissions({
        scope: {
          canReadAllObjectRecords: true,
          objectPermissions: [
            {
              objectUniversalIdentifier: 'person',
              canUpdateObjectRecords: true,
            },
            {
              objectUniversalIdentifier: 'unknown',
              canReadObjectRecords: true,
            },
          ],
          permissionFlagUniversalIdentifiers: [
            SystemPermissionFlag.SEND_EMAIL_TOOL,
            SystemPermissionFlag.WORKSPACE,
          ],
        },
        objectMetadataItems,
      }),
    ).toEqual({
      objectPermissions: [
        {
          objectMetadataId: null,
          canReadObjectRecords: true,
          canUpdateObjectRecords: undefined,
          canSoftDeleteObjectRecords: undefined,
          canDestroyObjectRecords: undefined,
        },
        {
          objectMetadataId: 'person-id',
          objectUniversalIdentifier: 'person',
          canUpdateObjectRecords: true,
        },
      ],
      permissionFlagKeys: [
        PermissionFlagType.SEND_EMAIL_TOOL,
        PermissionFlagType.WORKSPACE,
      ],
      otherPermissionLabels: [],
    });
  });

  it('lists the grants the editor has no row for', () => {
    expect(
      getWorkflowAiAgentScopePermissions({
        scope: {
          canUpdateAllSettings: true,
          canAccessAllTools: true,
          canReadAllObjectRecords: true,
          objectPermissions: [
            {
              objectUniversalIdentifier: 'company',
              canReadObjectRecords: false,
            },
          ],
          fieldPermissions: [
            {
              objectUniversalIdentifier: 'person',
              fieldUniversalIdentifier: 'email',
              canReadFieldValue: false,
            },
            {
              objectUniversalIdentifier: 'person',
              fieldUniversalIdentifier: 'phone',
              canUpdateFieldValue: false,
            },
          ],
        },
        objectMetadataItems,
      }).otherPermissionLabels,
    ).toEqual([
      'All settings',
      'All tools',
      'See Companies (denied)',
      'Field permissions on People',
    ]);
  });

  it('grants reading along with editing an object', () => {
    expect(
      applyWorkflowAiAgentScopeObjectPermissionChange({
        scope: undefined,
        objectUniversalIdentifier: 'person',
        permissionKey: 'canUpdateObjectRecords',
        isGranted: true,
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

  it('removes an object grant instead of denying it, so all objects still apply', () => {
    expect(
      applyWorkflowAiAgentScopeObjectPermissionChange({
        scope: {
          canReadAllObjectRecords: true,
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
        isGranted: false,
      }),
    ).toEqual({ canReadAllObjectRecords: true, objectPermissions: [] });
  });

  it('keeps the other grants of the scope when a grant is removed', () => {
    const fieldPermissions = [
      {
        objectUniversalIdentifier: 'person',
        fieldUniversalIdentifier: 'email',
        canReadFieldValue: false,
      },
    ];

    expect(
      applyWorkflowAiAgentScopeObjectPermissionChange({
        scope: {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canUpdateAllSettings: true,
          fieldPermissions,
          objectPermissions: [
            {
              objectUniversalIdentifier: 'company',
              canUpdateObjectRecords: true,
              canDestroyObjectRecords: false,
            },
          ],
        },
        objectUniversalIdentifier: 'company',
        permissionKey: 'canUpdateObjectRecords',
        isGranted: false,
      }),
    ).toEqual({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canUpdateAllSettings: true,
      fieldPermissions,
      objectPermissions: [
        {
          objectUniversalIdentifier: 'company',
          canDestroyObjectRecords: false,
        },
      ],
    });
  });

  it('removes every change on all objects when reading all objects is removed', () => {
    expect(
      applyWorkflowAiAgentScopeObjectPermissionChange({
        scope: {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          permissionFlagUniversalIdentifiers: [],
        },
        objectUniversalIdentifier: null,
        permissionKey: 'canReadObjectRecords',
        isGranted: false,
      }),
    ).toEqual({ permissionFlagUniversalIdentifiers: [] });
  });

  it('keeps the flags it does not know when a flag is granted or removed', () => {
    const scope = {
      permissionFlagUniversalIdentifiers: [
        'flag-from-a-newer-server',
        SystemPermissionFlag.SEND_EMAIL_TOOL,
      ],
    };

    const grantedScope = applyWorkflowAiAgentScopePermissionFlagChangeOrThrow({
      scope,
      permissionFlagKey: PermissionFlagType.HTTP_REQUEST_TOOL,
      isGranted: true,
    });

    expect(grantedScope.permissionFlagUniversalIdentifiers).toEqual([
      'flag-from-a-newer-server',
      SystemPermissionFlag.SEND_EMAIL_TOOL,
      SystemPermissionFlag.HTTP_REQUEST_TOOL,
    ]);
    expect(
      applyWorkflowAiAgentScopePermissionFlagChangeOrThrow({
        scope: grantedScope,
        permissionFlagKey: PermissionFlagType.SEND_EMAIL_TOOL,
        isGranted: false,
      }).permissionFlagUniversalIdentifiers,
    ).toEqual([
      'flag-from-a-newer-server',
      SystemPermissionFlag.HTTP_REQUEST_TOOL,
    ]);
  });
});
