import { parseRecordCapabilities } from 'src/engine/core-modules/record-permission/utils/parse-record-capabilities.util';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import {
  resolveObjectRecordPermissionPolicy,
  parseRecordPermissionPolicy,
} from 'twenty-shared/utils';
import { getPotentialRecordPermissionActions } from 'src/engine/core-modules/record-permission/utils/get-potential-record-permission-actions.util';
import { v4 } from 'uuid';

import { bindRecordPermissionCondition } from 'src/engine/core-modules/record-permission/utils/bind-record-permission-condition.util';
import {
  compileRecordPermission,
  compileRecordPermissionGroup,
} from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { resolveRecordPermissionPath } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-path.util';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

const groupsFor = (
  fixture: ReturnType<typeof createRecordPermissionTestContext>,
) =>
  resolveRecordPermissionAccessGroups({
    revisionId: fixture.context.revisionId,
    definition: fixture.context.definition,
    authority: fixture.context.authorities[0],
    metadata: fixture.context,
  });

describe('Record permission policies', () => {
  it('rejects malformed application capabilities without coercing values', () => {
    expect(parseRecordCapabilities({ read: false, create: true })).toEqual({
      read: false,
      create: true,
    });
    expect(parseRecordCapabilities(undefined)).toBeNull();
    expect(() => parseRecordCapabilities({ read: 'false' })).toThrow();
    expect(() => parseRecordCapabilities({ override: true })).toThrow();
  });

  it('rejects extra policy properties, duplicate identities, and paths beyond three fields', () => {
    const { context } = createRecordPermissionTestContext();
    expect(parseRecordPermissionPolicy(context.definition)).toEqual(
      context.definition,
    );
    expect(() =>
      parseRecordPermissionPolicy({ ...context.definition, bypass: true }),
    ).toThrow();
    expect(() =>
      parseRecordPermissionPolicy({
        ...context.definition,
        objects: [...context.definition.objects, context.definition.objects[0]],
      }),
    ).toThrow();
    context.definition.objects[3].inheritancePaths[0].fieldUniversalIdentifiers.push(
      v4(),
    );
    expect(() => parseRecordPermissionPolicy(context.definition)).toThrow();
  });

  it('resolves concrete field joins across a junction and rejects a disconnected path', () => {
    const { context, objects, people, message } =
      createRecordPermissionTestContext();
    const path = context.definition.objects[3].inheritancePaths[0];
    expect(
      resolveRecordPermissionPath({
        path,
        targetObjectUniversalIdentifier: objects.message.universalIdentifier,
        metadata: context,
      }).map(({ sourceColumn, targetColumn }) => [sourceColumn, targetColumn]),
    ).toEqual([
      ['id', 'companyId'],
      ['id', 'personId'],
      ['messageId', 'id'],
    ]);
    expect(() =>
      resolveRecordPermissionPath({
        path: {
          ...path,
          fieldUniversalIdentifiers: [
            people.universalIdentifier,
            message.universalIdentifier,
          ],
        },
        targetObjectUniversalIdentifier: objects.message.universalIdentifier,
        metadata: context,
      }),
    ).toThrow('connected');
  });

  it('shares bound groups for equal values without enumerating workspace members', () => {
    const fixture = createRecordPermissionTestContext();
    expect(groupsFor(fixture).map((group) => group.id)).toEqual(
      groupsFor(fixture).map((group) => group.id),
    );
    const original = groupsFor(fixture)[0].id;
    fixture.rule.condition = null;
    expect(groupsFor(fixture)[0].id).not.toBe(original);
  });

  it('fails closed for a member-bound condition without a member', () => {
    const { context, rule, memberCity, objects } =
      createRecordPermissionTestContext();
    if (rule.condition?.kind !== 'predicate')
      throw new Error('Expected predicate fixture');
    rule.condition.memberFieldUniversalIdentifier =
      memberCity.universalIdentifier;
    expect(
      bindRecordPermissionCondition({
        condition: rule.condition,
        authority: context.authorities[0],
        metadata: context,
        objectUniversalIdentifier: objects.company.universalIdentifier,
      }),
    ).toEqual({ not: { and: [] } });
  });

  it.each([
    JSON.stringify({ isCurrentWorkspaceMemberSelected: true }),
    { isCurrentWorkspaceMemberSelected: true },
  ])('fails closed for a current-member selector without a user', (value) => {
    const { context, rule, objects } = createRecordPermissionTestContext();
    if (rule.condition?.kind !== 'predicate')
      throw new Error('Expected predicate fixture');
    expect(
      bindRecordPermissionCondition({
        condition: { ...rule.condition, value },
        authority: context.authorities[0],
        metadata: context,
        objectUniversalIdentifier: objects.company.universalIdentifier,
      }),
    ).toEqual({ not: { and: [] } });
  });

  it('uses projected arrays for collections and live inheritance for point access', () => {
    const fixture = createRecordPermissionTestContext();
    const args = {
      context: fixture.context,
      action: 'read' as const,
      objectUniversalIdentifier: fixture.objects.message.universalIdentifier,
      tableAlias: 'message',
    };
    const collection = compileRecordPermission({
      ...args,
      strategy: 'projected',
    });
    expect(collection.sql).toContain('readableByAccessGroupIds');
    expect(collection.sql).not.toContain('"recordShare"');
    const point = compileRecordPermission({ ...args, strategy: 'live' });
    expect(point.sql).toContain('"messageParticipant"');
    expect(point.sql).not.toContain('readableByAccessGroupIds');
    expect(() =>
      compileNamedParameters(point.sql, point.parameters),
    ).not.toThrow();
  });

  it('intersects independent authorities and refuses capabilities that a grant cannot open', () => {
    const fixture = createRecordPermissionTestContext();
    fixture.context.authorities.push({
      roleId: v4(),
      roleUniversalIdentifier: v4(),
    });
    const args = {
      context: fixture.context,
      action: 'read' as const,
      objectUniversalIdentifier: fixture.objects.message.universalIdentifier,
      tableAlias: 'message',
      strategy: 'live' as const,
    };
    expect(compileRecordPermission(args).sql).toContain('FALSE');
    fixture.context.capabilitiesByObjectUniversalIdentifier[
      fixture.objects.message.universalIdentifier
    ] = { read: false };
    expect(compileRecordPermission(args).sql).toBe('FALSE');
  });

  it('traverses technical intermediary objects without granting access to them', () => {
    const fixture = createRecordPermissionTestContext();
    fixture.context.capabilitiesByObjectUniversalIdentifier[
      fixture.objects.messageParticipant.universalIdentifier
    ] = { read: false };
    const group = groupsFor(fixture)[0];
    const args = {
      context: fixture.context,
      group,
      action: 'read' as const,
      tableAlias: 'target',
    };
    expect(
      compileRecordPermissionGroup({
        ...args,
        objectUniversalIdentifier: fixture.objects.message.universalIdentifier,
      }).sql,
    ).toContain('"messageParticipant"');
    expect(
      compileRecordPermissionGroup({
        ...args,
        objectUniversalIdentifier:
          fixture.objects.messageParticipant.universalIdentifier,
      }).sql,
    ).toBe('FALSE');
  });
  it('applies global defaults to new objects and preserves explicit object overrides', () => {
    const { context, rule, objects } = createRecordPermissionTestContext();
    context.definition.defaults = [
      {
        ...rule,
        universalIdentifier: v4(),
        condition: null,
        actions: ['read'],
      },
    ];
    const newObject = v4();
    expect(
      resolveObjectRecordPermissionPolicy(context.definition, newObject)
        .rules[0].actions,
    ).toEqual(['read']);
    const objectPolicy = context.definition.objects.find(
      (object) =>
        object.objectUniversalIdentifier === objects.person.universalIdentifier,
    )!;
    objectPolicy.defaultOverrideRoleUniversalIdentifiers = [
      rule.roleUniversalIdentifier,
    ];
    expect(
      resolveObjectRecordPermissionPolicy(
        context.definition,
        objects.person.universalIdentifier,
      ).rules,
    ).toEqual([]);
    objectPolicy.defaultOverrideRoleUniversalIdentifiers = [];
    expect(
      resolveObjectRecordPermissionPolicy(
        context.definition,
        objects.person.universalIdentifier,
      ).rules[0].universalIdentifier,
    ).not.toBe(
      resolveObjectRecordPermissionPolicy(context.definition, newObject)
        .rules[0].universalIdentifier,
    );
  });

  it('caps delegation levels even when a Share rule matches', () => {
    const fixture = createRecordPermissionTestContext();
    fixture.rule.shareAccessLevel = RecordShareAccessLevel.READ;
    const group = groupsFor(fixture)[0];
    const args = {
      context: fixture.context,
      group,
      action: 'share' as const,
      objectUniversalIdentifier: fixture.objects.company.universalIdentifier,
      tableAlias: 'company',
    };
    expect(
      compileRecordPermissionGroup({
        ...args,
        delegatedAccessLevel: RecordShareAccessLevel.FULL,
      }).sql,
    ).toBe('FALSE');
    expect(
      compileRecordPermissionGroup({
        ...args,
        delegatedAccessLevel: RecordShareAccessLevel.READ,
      }).sql,
    ).not.toBe('FALSE');
  });

  it('exposes inherited objects to navigation while respecting capabilities', () => {
    const { context, objects, rule } = createRecordPermissionTestContext();
    const args = {
      context,
      objectUniversalIdentifier: objects.message.universalIdentifier,
      roleUniversalIdentifier: rule.roleUniversalIdentifier,
    };
    expect(getPotentialRecordPermissionActions(args).has('read')).toBe(true);
    context.capabilitiesByObjectUniversalIdentifier[
      objects.message.universalIdentifier
    ] = { read: false };
    expect(getPotentialRecordPermissionActions(args).has('read')).toBe(false);
  });
});
