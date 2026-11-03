import { extractTargetIdsFromResolverArgs } from 'src/engine/core-modules/server-admin-access/utils/extract-target-ids-from-resolver-args.util';

describe('extractTargetIdsFromResolverArgs', () => {
  it('keeps identifier arguments at the top level and inside the input object', () => {
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

  it('keeps identifier arrays of batch operations', () => {
    expect(
      extractTargetIdsFromResolverArgs({ jobIds: ['job-1', 'job-2'] }),
    ).toEqual({ jobIds: ['job-1', 'job-2'] });
  });

  it('lets a top-level identifier win over a nested one of the same name', () => {
    expect(
      extractTargetIdsFromResolverArgs({
        workspaceId: 'top-level',
        input: { workspaceId: 'nested' },
      }),
    ).toEqual({ workspaceId: 'top-level' });
  });

  it('drops non-identifier arguments and never reads untyped JSON arguments', () => {
    expect(
      extractTargetIdsFromResolverArgs({
        key: 'OPENAI_API_KEY',
        value: 'sk-secret',
        providerConfig: { accessKeyId: 'AKIA-secret', apiKey: 'sk-secret' },
      }),
    ).toEqual({});
  });
});
