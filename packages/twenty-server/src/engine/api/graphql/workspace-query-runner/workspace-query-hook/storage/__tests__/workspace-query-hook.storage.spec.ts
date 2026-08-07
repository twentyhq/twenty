import { type Module } from '@nestjs/core/injector/module';

import {
  type WorkspacePostQueryHookInstance,
  type WorkspacePreQueryHookInstance,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';

const HOST = {} as Module;

const buildPostHook = (name: string) =>
  ({
    execute: jest.fn(),
    name,
  }) as unknown as WorkspacePostQueryHookInstance;

const buildPreHook = (name: string) =>
  ({
    execute: jest.fn(),
    name,
  }) as unknown as WorkspacePreQueryHookInstance;

describe('WorkspaceQueryHookStorage', () => {
  let storage: WorkspaceQueryHookStorage;

  beforeEach(() => {
    storage = new WorkspaceQueryHookStorage();
  });

  const registerPostHook = (
    key: Parameters<
      WorkspaceQueryHookStorage['registerWorkspacePostQueryHookInstance']
    >[0],
    instance: WorkspacePostQueryHookInstance,
  ) =>
    storage.registerWorkspacePostQueryHookInstance(key, {
      instance,
      host: HOST,
      isRequestScoped: false,
    });

  const getPostHookInstances = (
    key: Parameters<
      WorkspaceQueryHookStorage['getWorkspacePostQueryHookInstances']
    >[0],
  ) =>
    storage
      .getWorkspacePostQueryHookInstances(key)
      .map(({ instance }) => instance);

  it('returns a hook registered on the exact object and operation', () => {
    const hook = buildPostHook('exact');

    registerPostHook('message.findMany', hook);

    expect(getPostHookInstances('message.findMany')).toEqual([hook]);
  });

  it('returns a hook registered on every operation of an object', () => {
    const hook = buildPostHook('everyOperation');

    registerPostHook('message.*', hook);

    expect(getPostHookInstances('message.findMany')).toEqual([hook]);
    expect(getPostHookInstances('message.updateOne')).toEqual([hook]);
    expect(getPostHookInstances('message.destroyMany')).toEqual([hook]);
  });

  it('does not apply an object wildcard to a different object', () => {
    registerPostHook('message.*', buildPostHook('everyOperation'));

    expect(getPostHookInstances('company.findMany')).toEqual([]);
  });

  it('returns a hook registered on every object for an operation', () => {
    const hook = buildPostHook('everyObject');

    registerPostHook('*.findMany', hook);

    expect(getPostHookInstances('message.findMany')).toEqual([hook]);
    expect(getPostHookInstances('company.findMany')).toEqual([hook]);
  });

  it('does not apply an operation wildcard to a different operation', () => {
    registerPostHook('*.findMany', buildPostHook('everyObject'));

    expect(getPostHookInstances('message.updateOne')).toEqual([]);
  });

  it('combines both wildcards with the exact match for one key', () => {
    const everyObject = buildPostHook('everyObject');
    const everyOperation = buildPostHook('everyOperation');
    const exact = buildPostHook('exact');

    registerPostHook('*.findMany', everyObject);
    registerPostHook('message.*', everyOperation);
    registerPostHook('message.findMany', exact);

    expect(getPostHookInstances('message.findMany')).toEqual([
      everyObject,
      everyOperation,
      exact,
    ]);
  });

  it('resolves pre-query hooks through the same matching rules', () => {
    const hook = buildPreHook('everyOperation');

    storage.registerWorkspaceQueryPreHookInstance('message.*', {
      instance: hook,
      host: HOST,
      isRequestScoped: false,
    });

    expect(
      storage
        .getWorkspaceQueryPreHookInstances('message.updateOne')
        .map(({ instance }) => instance),
    ).toEqual([hook]);
  });

  it('rejects a key that is not object and operation', () => {
    expect(() =>
      getPostHookInstances(
        'message' as Parameters<
          WorkspaceQueryHookStorage['getWorkspacePostQueryHookInstances']
        >[0],
      ),
    ).toThrow("Can't split workspace query hook key: message");
  });
});
