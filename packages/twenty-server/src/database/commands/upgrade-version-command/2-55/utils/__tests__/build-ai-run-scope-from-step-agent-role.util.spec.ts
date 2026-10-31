import { buildAiRunScopeFromStepAgentRole } from 'src/database/commands/upgrade-version-command/2-55/utils/build-ai-run-scope-from-step-agent-role.util';

const DENY_ALL_ROLE: Parameters<typeof buildAiRunScopeFromStepAgentRole>[0] = {
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

  it('keeps the tools and settings grants of the role', () => {
    expect(
      buildAiRunScopeFromStepAgentRole({
        ...DENY_ALL_ROLE,
        canAccessAllTools: true,
        canUpdateAllSettings: true,
      }),
    ).toEqual({
      canAccessAllTools: true,
      canUpdateAllSettings: true,
    });
  });
});
