import { collectInventory } from '../utils/collectInventory';
import { compareInventoryCollections } from '../utils/compareInventoryCollections';
import { getInventoryTargetId } from '../utils/getInventoryTargetId';
import { inspectInventoryObject } from '../utils/inspectInventoryObject';
import { validateInventoryCollection } from '../utils/validateInventoryCollection';
import { withInventoryTimeout } from '../utils/withInventoryTimeout';
import { inventoryMemberSchema } from '../schemas/inventoryMemberSchema';

const createObjects = (scope: object) => ({
  globalThis: scope,
  window: scope,
  factories: {
    'rendered.div': () => ({ tagName: 'DIV' }),
    'rendered.svg': () => ({ tagName: 'svg' }),
  },
});

const collectReference = () =>
  collectInventory({
    objects: createObjects({
      available: () => 'expected',
      missing: () => true,
    }),
    runtime: 'reference',
  });

describe('browser API inventory', () => {
  it('inspects inherited and non-enumerable descriptors without calling getters or constructors', () => {
    const getter = jest.fn(() => {
      throw new Error('getter invoked');
    });
    const constructor = jest.fn(() => {
      throw new Error('constructor invoked');
    });
    const prototype = Object.create(null);
    Object.defineProperty(prototype, 'inherited', { value: () => true });
    Object.defineProperty(prototype, 'accessor', { get: getter });
    const value = Object.assign(Object.create(prototype), { constructor });
    const { members } = inspectInventoryObject({ value, targetId: 'object' });
    expect(
      members.find((member) => member.id === 'object.inherited')?.observation,
    ).toMatchObject({ shape: 'callable', depth: 1, enumerable: false });
    expect(
      members.find((member) => member.id === 'object.accessor')?.observation,
    ).toMatchObject({ shape: 'accessor', getter: true });
    expect(getter).not.toHaveBeenCalled();
    expect(constructor).not.toHaveBeenCalled();
  });

  it('distinguishes missing APIs from callable but behaviorally incorrect APIs', () => {
    const { catalog, collection: reference } = collectReference();
    const { collection: sandbox } = collectInventory({
      objects: createObjects({ available: () => 'incorrect' }),
      runtime: 'react',
      catalog,
    });
    const findings = compareInventoryCollections({
      reference,
      sandbox,
      runtime: 'react',
    });
    expect(
      findings.find((finding) => finding.id === 'window.missing'),
    ).toMatchObject({ scope: 'member', observation: 'missing' });
    expect(
      findings.find((finding) => finding.id === 'window.available'),
    ).toMatchObject({
      observation: 'present-behavior-unverified',
      behavior: 'unverified',
    });
  });

  it('keeps placement differences separate from callable availability and value shape changes', () => {
    const { catalog, collection: reference } = collectReference();
    const { collection: sandbox } = collectInventory({
      objects: createObjects(
        Object.create({ available: () => true, missing: 42 }),
      ),
      runtime: 'preact',
      catalog,
    });
    const findings = compareInventoryCollections({
      reference,
      sandbox,
      runtime: 'preact',
    });
    expect(
      findings.find((finding) => finding.id === 'window.available'),
    ).toMatchObject({
      observation: 'present-behavior-unverified',
      isPlacementDifferent: true,
      runtimes: ['preact'],
    });
    expect(
      findings.find((finding) => finding.id === 'window.missing'),
    ).toMatchObject({ observation: 'shape-mismatch' });
    expect(() =>
      validateInventoryCollection({
        catalog,
        collection: sandbox,
        runtime: 'react',
      }),
    ).toThrow('incorrectly labelled');
  });

  it('flags descriptor flag differences on members that keep their shape', () => {
    const { catalog, collection: reference } = collectReference();
    const scope = { missing: () => true };
    Object.defineProperty(scope, 'available', {
      value: () => true,
      enumerable: false,
      writable: true,
      configurable: true,
    });
    const { collection: sandbox } = collectInventory({
      objects: createObjects(scope),
      runtime: 'react',
      catalog,
    });
    expect(
      compareInventoryCollections({
        reference,
        sandbox,
        runtime: 'react',
      }).find((finding) => finding.id === 'window.available'),
    ).toMatchObject({
      observation: 'present-behavior-unverified',
      isPlacementDifferent: false,
      isDescriptorDifferent: true,
    });
  });

  it('rejects dropped targets, dropped members, duplicates, empty collections, and malformed observations', () => {
    const { catalog, collection } = collectReference();
    const invalidCollections = [
      { ...collection, targets: [] },
      { ...collection, targets: collection.targets.slice(1) },
      {
        ...collection,
        targets: [collection.targets[0], ...collection.targets.slice(0, -1)],
      },
      {
        ...collection,
        targets: collection.targets.map((target, index) =>
          index === 0
            ? { ...target, members: target.members.slice(1) }
            : target,
        ),
      },
      {
        ...collection,
        targets: collection.targets.map((target, index) =>
          index === 0
            ? { ...target, members: [...target.members, target.members[0]] }
            : target,
        ),
      },
      {
        ...collection,
        targets: collection.targets.map((target, index) =>
          index === 0
            ? {
                ...target,
                members: target.members.map((member, memberIndex) =>
                  memberIndex === 0
                    ? { ...member, observation: { shape: 'callable' } }
                    : member,
                ),
              }
            : target,
        ),
      },
      { ...collection, schemaVersion: 2 },
    ];
    for (const invalid of invalidCollections) {
      expect(() =>
        validateInventoryCollection({
          catalog,
          collection: invalid,
          runtime: 'reference',
        }),
      ).toThrow();
    }
  });

  it('preserves well-known and registered symbols while disclosing unstable local symbols', () => {
    const { members, skipped } = inspectInventoryObject({
      value: {
        [Symbol.iterator]: () => [],
        [Symbol.for('audit')]: 1,
        [Symbol('local')]: 2,
      },
      targetId: 'object',
    });
    expect(members.map((member) => member.id)).toEqual(
      expect.arrayContaining([
        'object[Symbol.iterator]',
        'object[Symbol.for("audit")]',
      ]),
    );
    expect(skipped).toEqual([
      { id: 'object', reason: 'Unstable local symbol: Symbol(local)' },
    ]);
  });

  it('keeps enumerated reference members without descriptors uninspectable', () => {
    const opaque = new Proxy({}, { ownKeys: () => ['opaque'] });
    const { catalog, collection: reference } = collectInventory({
      objects: createObjects(opaque),
      runtime: 'reference',
    });
    const { collection: sandbox } = collectInventory({
      objects: createObjects({ opaque: () => true }),
      runtime: 'react',
      catalog,
    });
    const findings = compareInventoryCollections({
      reference,
      sandbox,
      runtime: 'react',
    });
    expect(
      findings.find((finding) => finding.id === 'window.opaque'),
    ).toMatchObject({ observation: 'uninspectable' });
  });

  it('reports sandbox members served only through proxy traps as uninspectable instead of missing', () => {
    const { catalog, collection: reference } = collectReference();
    const trapServedScope = new Proxy(
      {},
      {
        get: (_target, property) =>
          property === 'available' ? () => 'served' : undefined,
      },
    );
    const { collection: sandbox } = collectInventory({
      objects: createObjects(trapServedScope),
      runtime: 'react',
      catalog,
    });
    const windowMembers = sandbox.targets.find(
      ({ target }) => target.kind === 'global' && target.surface === 'window',
    )?.members;
    expect(
      windowMembers?.find((member) => member.id === 'window.available')
        ?.observation,
    ).toEqual({
      shape: 'uninspectable',
      reason: 'Served without a property descriptor (function)',
    });
    const findings = compareInventoryCollections({
      reference,
      sandbox,
      runtime: 'react',
    });
    expect(
      findings.find((finding) => finding.id === 'window.available'),
    ).toMatchObject({ observation: 'uninspectable' });
    expect(
      findings.find((finding) => finding.id === 'window.missing'),
    ).toMatchObject({ observation: 'missing' });
  });

  it('rejects contradictory callable and value type observations', () => {
    expect(
      inventoryMemberSchema.safeParse({
        id: 'window.example',
        key: { kind: 'string', name: 'example' },
        observation: {
          shape: 'callable',
          valueType: 'number',
          writable: true,
          enumerable: true,
          configurable: true,
          depth: 0,
        },
      }).success,
    ).toBe(false);
  });

  it('keeps sandbox-only generated property names outside reference coverage', () => {
    const { catalog } = collectReference();
    const collections = ['first', 'second'].map(
      (suffix) =>
        collectInventory({
          objects: createObjects({
            available: () => true,
            missing: () => true,
            [`private_${suffix}`]: {},
          }),
          runtime: 'react',
          catalog,
        }).collection,
    );
    expect(collections[0]).toEqual(collections[1]);
  });

  it('expands statics once when window is globalThis and separately when it is not', () => {
    const { catalog } = collectReference();
    const sharedTargetIds = catalog.targets.map(({ target }) =>
      getInventoryTargetId(target),
    );
    expect(sharedTargetIds).toEqual(
      expect.arrayContaining(['globalThis', 'window', 'globalThis.available']),
    );
    expect(sharedTargetIds).not.toContain('window.available');

    const { catalog: separateCatalog } = collectInventory({
      objects: {
        ...createObjects({ available: () => true }),
        window: { available: () => true },
      },
      runtime: 'reference',
    });
    expect(
      separateCatalog.targets.map(({ target }) => getInventoryTargetId(target)),
    ).toEqual(
      expect.arrayContaining(['globalThis.available', 'window.available']),
    );
  });

  it('discloses sandbox window values that differ from their globalThis counterparts', () => {
    const { catalog } = collectReference();
    const sharedMissing = () => true;
    const { collection } = collectInventory({
      objects: {
        ...createObjects({ available: () => true, missing: sharedMissing }),
        window: { available: () => 'distinct', missing: sharedMissing },
      },
      runtime: 'react',
      catalog,
    });
    expect(collection.coverage.skipped).toContainEqual({
      id: 'window.available',
      reason:
        'Window value differs from globalThis; its members are not expanded separately',
    });
    expect(collection.coverage.skipped).not.toContainEqual(
      expect.objectContaining({ id: 'window.missing' }),
    );
  });

  it('discloses unexpanded values and rejects prototype cycles or failed enumeration', () => {
    const scope: Record<string, unknown> = {};
    scope.self = scope;
    expect(
      collectInventory({ objects: createObjects(scope), runtime: 'reference' })
        .collection.coverage.skipped,
    ).toContainEqual({
      id: 'window.self',
      reason:
        'Nested object or accessor value not recursively inspected; explicit factory targets are measured separately',
    });
    const cyclicPrototype: object = new Proxy(
      {},
      { getPrototypeOf: () => cyclicPrototype },
    );
    expect(() =>
      inspectInventoryObject({ value: cyclicPrototype, targetId: 'cycle' }),
    ).toThrow('Prototype cycle');
    expect(() =>
      inspectInventoryObject({
        value: new Proxy(
          {},
          {
            ownKeys: () => {
              throw new Error('blocked');
            },
          },
        ),
        targetId: 'blocked',
      }),
    ).toThrow('blocked');
  });

  it('records a sandbox target whose enumeration throws without aborting the collection', () => {
    const { catalog } = collectReference();
    const referenceObjects = createObjects({
      available: () => true,
      missing: () => true,
    });
    const blockedEnumeration = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new Error('blocked');
        },
      },
    );
    const objects = {
      ...referenceObjects,
      factories: {
        ...referenceObjects.factories,
        'rendered.div': () => blockedEnumeration,
      },
    };
    const { collection } = collectInventory({
      objects,
      catalog,
      runtime: 'react',
    });
    expect(
      collection.targets.find(
        ({ target }) =>
          target.kind === 'factory' && target.name === 'rendered.div',
      ),
    ).toMatchObject({ status: 'uninspectable', reason: 'Error: blocked' });
    expect(
      collection.targets.find(
        ({ target }) =>
          target.kind === 'factory' && target.name === 'rendered.svg',
      ),
    ).toMatchObject({ status: 'collected' });
    expect(() => collectInventory({ objects, runtime: 'reference' })).toThrow(
      'Reference target instance:rendered.div: Error: blocked',
    );
  });

  it('records uninspectable factories explicitly and never accepts them as reference expectations', () => {
    const { catalog } = collectReference();
    const objects = createObjects({
      available: () => true,
      missing: () => true,
    });
    objects.factories['rendered.div'] = () => {
      throw new Error('factory unavailable');
    };
    const { collection } = collectInventory({
      objects,
      catalog,
      runtime: 'react',
    });
    expect(
      collection.targets.find(
        (target) =>
          target.target.kind === 'factory' &&
          target.target.name === 'rendered.div',
      ),
    ).toMatchObject({
      status: 'uninspectable',
      reason: 'Error: factory unavailable',
    });
    expect(() => collectInventory({ objects, runtime: 'reference' })).toThrow(
      'Reference target',
    );
  });

  it('rejects a sandbox fixture that has no factory for a catalog target', () => {
    const objects = createObjects({
      available: () => true,
      missing: () => true,
    });
    const { catalog } = collectInventory({
      objects: {
        ...objects,
        factories: { ...objects.factories, 'html.section': () => ({}) },
      },
      runtime: 'reference',
    });
    expect(() =>
      collectInventory({ objects, catalog, runtime: 'react' }),
    ).toThrow('The inventory fixture has no factory for html.section');
  });

  it.each([undefined, 42])(
    'rejects a reference factory returning %p while recording the sandbox gap',
    (value) => {
      const objects = createObjects({
        available: () => true,
        missing: () => true,
      });
      const { catalog, collection: reference } = collectInventory({
        objects: {
          ...objects,
          factories: {
            ...objects.factories,
            'navigator.clipboard': () => ({ readText: () => '' }),
          },
        },
        runtime: 'reference',
      });
      const objectsWithMissingFactory = {
        ...objects,
        factories: { ...objects.factories, 'navigator.clipboard': () => value },
      };
      const { collection } = collectInventory({
        objects: objectsWithMissingFactory,
        catalog,
        runtime: 'react',
      });
      expect(
        collection.targets.find(
          (target) =>
            target.target.kind === 'factory' &&
            target.target.name === 'navigator.clipboard',
        ),
      ).toMatchObject({
        status: 'missing',
        members: expect.arrayContaining([
          expect.objectContaining({
            id: 'instance:navigator.clipboard.readText',
            observation: { shape: 'missing' },
          }),
        ]),
      });
      expect(() =>
        validateInventoryCollection({ catalog, collection, runtime: 'react' }),
      ).not.toThrow();
      expect(
        compareInventoryCollections({
          reference,
          sandbox: collection,
          runtime: 'react',
        }).filter(
          (finding) => finding.targetId === 'instance:navigator.clipboard',
        ),
      ).toEqual([
        {
          scope: 'target',
          id: 'instance:navigator.clipboard',
          targetId: 'instance:navigator.clipboard',
          runtimes: ['react'],
          observation: 'missing',
          reason: 'Target is absent or is not an object',
          memberCount: reference.targets.find(
            ({ target }) =>
              target.kind === 'factory' &&
              target.name === 'navigator.clipboard',
          )?.members.length,
        },
      ]);
      expect(() =>
        collectInventory({
          objects: objectsWithMissingFactory,
          runtime: 'reference',
        }),
      ).toThrow('Reference target instance:navigator.clipboard');
    },
  );

  it('fails a stalled collection using the external timeout supervisor', async () => {
    await expect(
      withInventoryTimeout({
        operation: new Promise<never>(() => {}),
        timeout: 10,
        label: 'fixture',
      }),
    ).rejects.toThrow('fixture timed out');
  });
});
