import { extractTargetIdsFromResolverArgs } from 'src/engine/core-modules/server-admin-access/utils/extract-target-ids-from-resolver-args.util';

describe('extractTargetIdsFromResolverArgs', () => {
  it('keeps identifier arguments at the top level and inside inputs', () => {
    expect(
      extractTargetIdsFromResolverArgs({
        workspaceId: 'workspace-1',
        input: { userId: 'user-1', id: 'grant-1' },
      }),
    ).toEqual({
      workspaceId: 'workspace-1',
      userId: 'user-1',
      id: 'grant-1',
    });
  });

  it('drops every non-identifier argument, which may hold secrets', () => {
    expect(
      extractTargetIdsFromResolverArgs({
        key: 'OPENAI_API_KEY',
        value: 'sk-secret',
        input: { apiKey: 'sk-secret', providerName: 'openai' },
      }),
    ).toEqual({});
  });
});
