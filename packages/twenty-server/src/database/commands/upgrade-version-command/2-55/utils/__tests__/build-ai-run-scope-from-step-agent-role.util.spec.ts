import { buildAiRunScopeFromStepAgentRole } from 'src/database/commands/upgrade-version-command/2-55/utils/build-ai-run-scope-from-step-agent-role.util';

const DENY_ALL_ROLE = {
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  objectPermissions: [],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
};

describe('buildAiRunScopeFromStepAgentRole', () => {
  it('gives an empty scope for a role that grants nothing', () => {
    expect(buildAiRunScopeFromStepAgentRole(DENY_ALL_ROLE)).toEqual({});
  });

  it('keeps the object, field and flag grants of the role', () => {
    expect(
      buildAiRunScopeFromStepAgentRole({
        ...DENY_ALL_ROLE,
        canReadAllObjectRecords: true,
        objectPermissions: [
          {
            objectUniversalIdentifier: 'company',
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: null,
            canDestroyObjectRecords: null,
          },
          {
            objectUniversalIdentifier: 'person',
            canReadObjectRecords: null,
            canUpdateObjectRecords: null,
            canSoftDeleteObjectRecords: null,
            canDestroyObjectRecords: null,
          },
        ],
        fieldPermissions: [
          {
            objectUniversalIdentifier: 'person',
            fieldUniversalIdentifier: 'email',
            canReadFieldValue: false,
            canUpdateFieldValue: null,
          },
        ],
        permissionFlagUniversalIdentifiers: ['send-email', 'ai'],
      }),
    ).toEqual({
      canReadAllObjectRecords: true,
      objectPermissions: [
        {
          objectUniversalIdentifier: 'company',
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
        },
      ],
      fieldPermissions: [
        {
          objectUniversalIdentifier: 'person',
          fieldUniversalIdentifier: 'email',
          canReadFieldValue: false,
        },
      ],
      permissionFlagUniversalIdentifiers: ['ai', 'send-email'],
    });
  });
});
