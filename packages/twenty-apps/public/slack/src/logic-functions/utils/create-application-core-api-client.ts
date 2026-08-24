import { CoreApiClient } from 'twenty-client-sdk/core';

type CoreApiClientConstructorWithRunAs = new (options?: {
  runAs?: 'user' | 'application';
}) => CoreApiClient;

// The ungenerated CoreApiClient stub declares a zero-arg constructor; the
// generated client that replaces it on install accepts runAs. The cast keeps
// typecheck honest against the stub until the stub signature catches up.
export const createApplicationCoreApiClient = (): CoreApiClient =>
  new (CoreApiClient as CoreApiClientConstructorWithRunAs)({
    runAs: 'application',
  });
