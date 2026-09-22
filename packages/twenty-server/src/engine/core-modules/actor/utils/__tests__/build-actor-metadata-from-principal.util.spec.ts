import { FieldActorSource } from 'twenty-shared/types';

import { buildActorMetadataFromPrincipal } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-principal.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const WORKSPACE_MEMBER = {
  id: '20202020-0687-4c41-b707-ed1bfca972a7',
  name: { firstName: 'Tim', lastName: 'Apple' },
} satisfies Pick<WorkspaceMemberWorkspaceEntity, 'id' | 'name'>;

const APPLICATION = {
  id: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  name: 'People Data Labs',
} as FlatApplication;

describe('buildActorMetadataFromPrincipal', () => {
  it('attributes to the workspace member when there is one', () => {
    const actor = buildActorMetadataFromPrincipal({
      workspaceMember: WORKSPACE_MEMBER,
      application: APPLICATION,
    });

    expect(actor?.workspaceMemberId).toBe(WORKSPACE_MEMBER.id);
    expect(actor?.source).toBe(FieldActorSource.MANUAL);
  });

  it('falls back to the application when no workspace member is authenticated', () => {
    const actor = buildActorMetadataFromPrincipal({
      application: APPLICATION,
    });

    expect(actor?.workspaceMemberId).toBeNull();
    expect(actor?.name).toBe(APPLICATION.name);
  });

  it('returns undefined when neither principal is present', () => {
    expect(buildActorMetadataFromPrincipal({})).toBeUndefined();
  });
});
