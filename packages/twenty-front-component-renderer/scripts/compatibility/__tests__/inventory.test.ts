import { collectInventory } from '../utils/collectInventory';
import { compareInventoryCollections } from '../utils/compareInventoryCollections';
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
      catalog,
      reference,
      sandbox,
      runtime: 'react',
    });
    expect(
      findings.find((finding) => finding.id === 'window.missing'),
    ).toMatchObject({ observation: 'missing' });
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
      catalog,
      reference,
      sandbox,
      runtime: 'preact',
    });
    expect(
      findings.find((finding) => finding.id === 'window.available'),
    ).toMatchObject({
      observation: 'present-behavior-unverified',
      placementDiffers: true,
      runtime: 'preact',
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
      catalog,
      reference,
      sandbox,
      runtime: 'react',
    });
    expect(
      findings.find((finding) => finding.id === 'window.opaque'),
    ).toMatchObject({ observation: 'uninspectable' });
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

  it('discloses cyclic values and rejects prototype cycles or failed enumeration', () => {
    const scope: Record<string, unknown> = {};
    scope.self = scope;
    expect(
      collectInventory({ objects: createObjects(scope), runtime: 'reference' })
        .collection.coverage.skipped,
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'window.self' })]),
    );
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
