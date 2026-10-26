import { v4 } from 'uuid';
import { type RecordPermissionPolicyDefinition } from 'twenty-shared/types';
import { resolveObjectRecordPermissionPolicy } from 'twenty-shared/utils';

import { updateRecordPermissionRoleOverride } from '@/settings/record-permissions/utils/updateRecordPermissionRoleOverride';

describe('Record permission role editing', () => {
  it('keeps other roles on their defaults when one role overrides an object', () => {
    const firstRole = v4();
    const secondRole = v4();
    const object = v4();
    const definition: RecordPermissionPolicyDefinition = {
      version: 1,
      objects: [],
      defaults: [firstRole, secondRole].map((roleUniversalIdentifier) => ({
        universalIdentifier: v4(),
        label: 'Default',
        roleUniversalIdentifier,
        actions: ['read'],
        condition: null,
      })),
    };
    const resolved = resolveObjectRecordPermissionPolicy(definition, object);
    const updated = updateRecordPermissionRoleOverride({
      definition,
      policy: {
        ...resolved,
        rules: resolved.rules.map((rule) =>
          rule.roleUniversalIdentifier === firstRole
            ? { ...rule, actions: ['update'] }
            : rule,
        ),
      },
      roleUniversalIdentifier: firstRole,
    });
    expect(
      updated.objects[0].rules.map((rule) => rule.roleUniversalIdentifier),
    ).toEqual([firstRole]);
    const changedDefaults = {
      ...updated,
      defaults: updated.defaults?.map((rule) => ({
        ...rule,
        actions: ['destroy' as const],
      })),
    };
    const permissions = resolveObjectRecordPermissionPolicy(
      changedDefaults,
      object,
    );
    expect(
      permissions.rules.find(
        (rule) => rule.roleUniversalIdentifier === firstRole,
      )?.actions,
    ).toEqual(['update']);
    expect(
      permissions.rules.find(
        (rule) => rule.roleUniversalIdentifier === secondRole,
      )?.actions,
    ).toEqual(['destroy']);
  });

  it('keeps an explicit no-access override when its last action is removed', () => {
    const role = v4();
    const object = v4();
    const definition: RecordPermissionPolicyDefinition = {
      version: 1,
      objects: [],
      defaults: [
        {
          universalIdentifier: v4(),
          label: 'Default',
          roleUniversalIdentifier: role,
          condition: null,
          actions: ['read'],
        },
      ],
    };
    const updated = updateRecordPermissionRoleOverride({
      definition,
      roleUniversalIdentifier: role,
      policy: {
        objectUniversalIdentifier: object,
        rules: [],
        inheritancePaths: [],
      },
    });
    expect(resolveObjectRecordPermissionPolicy(updated, object).rules).toEqual(
      [],
    );
  });
});
