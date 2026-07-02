import { installOriginStorageIsolation } from '../installOriginStorageIsolation';

const PREFIX = 'front-component:';

describe('installOriginStorageIsolation', () => {
  describe('BroadcastChannel', () => {
    it('should prefix channel names so host channels are unreachable', () => {
      const constructedNames: string[] = [];
      class FakeBroadcastChannel {
        constructor(name: string) {
          constructedNames.push(name);
        }
      }
      const scope = { BroadcastChannel: FakeBroadcastChannel };

      installOriginStorageIsolation(scope as never);
      const channel = new scope.BroadcastChannel('twenty-sign-out');

      expect(channel).toBeDefined();
      expect(constructedNames).toEqual([`${PREFIX}twenty-sign-out`]);
    });

    it('should keep the namespaced channel an instanceof the original channel', () => {
      class FakeBroadcastChannel {
        constructor(public name: string) {}
      }
      const scope = { BroadcastChannel: FakeBroadcastChannel };

      installOriginStorageIsolation(scope as never);
      const channel = new scope.BroadcastChannel('my-channel');

      expect(channel).toBeInstanceOf(scope.BroadcastChannel);
      expect(channel).toBeInstanceOf(FakeBroadcastChannel);
    });
  });

  describe('indexedDB', () => {
    const createFakeIndexedDb = () => {
      const openedNames: string[] = [];
      const deletedNames: string[] = [];

      return {
        openedNames,
        deletedNames,
        factory: {
          open: (name: string) => {
            openedNames.push(name);
            return { name };
          },
          deleteDatabase: (name: string) => {
            deletedNames.push(name);
          },
          databases: async () => [
            { name: `${PREFIX}mine`, version: 1 },
            { name: 'twenty-front-metadata-store', version: 1 },
          ],
          cmp: () => 0,
        },
      };
    };

    it('should prefix opened database names', () => {
      const { factory, openedNames } = createFakeIndexedDb();
      const scope = { indexedDB: factory };

      installOriginStorageIsolation(scope as never);
      scope.indexedDB.open('twenty-front-metadata-store');

      expect(openedNames).toEqual([`${PREFIX}twenty-front-metadata-store`]);
    });

    it('should prefix deleted database names', () => {
      const { factory, deletedNames } = createFakeIndexedDb();
      const scope = { indexedDB: factory };

      installOriginStorageIsolation(scope as never);
      scope.indexedDB.deleteDatabase('some-db');

      expect(deletedNames).toEqual([`${PREFIX}some-db`]);
    });

    it('should only expose the component own databases with their unprefixed names', async () => {
      const { factory } = createFakeIndexedDb();
      const scope = { indexedDB: factory };

      installOriginStorageIsolation(scope as never);
      const databases = await scope.indexedDB.databases();

      expect(databases).toEqual([{ name: 'mine', version: 1 }]);
    });
  });

  it('should do nothing when the primitives are absent', () => {
    expect(() => installOriginStorageIsolation({} as never)).not.toThrow();
  });
});
