import { CoreApiClient } from 'twenty-client-sdk/core';

type CoreApiClientConstructorWithRunAs = new (options?: {
  runAs?: 'user' | 'application';
}) => CoreApiClient;

// The ungenerated CoreApiClient stub declares a zero-arg constructor; the
// generated client that replaces it on install accepts runAs. The cast keeps
// typecheck honest against the stub until the stub signature catches up.
// TODO: delete this util and call `new CoreApiClient({ runAs: 'application' })`
// directly once the stub fix (twentyhq/twenty#24671) ships in a
// twenty-client-sdk release this app depends on.
export const createApplicationCoreApiClient = (): CoreApiClient =>
  new (CoreApiClient as CoreApiClientConstructorWithRunAs)({
    runAs: 'application',
  });
