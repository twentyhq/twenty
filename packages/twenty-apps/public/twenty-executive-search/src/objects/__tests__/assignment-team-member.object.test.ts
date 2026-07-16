import { describe, expect, it } from 'vitest';

import {
  ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

describe('assignment-team-member object', () => {
  it('validates without errors', async () => {
    const mod = await import('src/objects/assignment-team-member.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(result.config.nameSingular).toBe('assignmentTeamMember');
  });

  it('has 6 fields including relations', async () => {
    const mod = await import('src/objects/assignment-team-member.object');
    const fields = mod.default.config.fields;
    expect(fields.length).toBe(6);
  });

  it('has role SELECT with 6 options', async () => {
    const mod = await import('src/objects/assignment-team-member.object');
    const fields = mod.default.config.fields;
    const roleField = fields.find(
      (f: { universalIdentifier: string }) =>
        f.universalIdentifier ===
        ASSIGNMENT_TEAM_MEMBER_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(roleField).toBeDefined();
    expect(roleField!.options).toBeDefined();
    expect(roleField!.options!.length).toBe(6);
  });

  it('has no labelIdentifier (junction style)', async () => {
    const mod = await import('src/objects/assignment-team-member.object');
    expect(
      mod.default.config.labelIdentifierFieldMetadataUniversalIdentifier,
    ).toBeUndefined();
  });
});
