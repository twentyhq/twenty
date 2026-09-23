import { collectInventory } from '../collectInventory';
import { validateInventoryCollection } from '../validateInventoryCollection';

const OBJECTS = {
  globalThis: { available: () => true },
  window: { available: () => true },
  factories: {
    'rendered.div': () => ({ tagName: 'DIV' }),
    'rendered.svg': () => ({ tagName: 'svg' }),
  },
};

const collectReference = () =>
  collectInventory({ objects: OBJECTS, runtime: 'reference' });

describe('validateInventoryCollection', () => {
  it('accepts complete reference and sandbox collections', () => {
    const { catalog, collection } = collectReference();
    const { collection: sandbox } = collectInventory({
      objects: OBJECTS,
      catalog,
      runtime: 'react',
    });
    expect(
      validateInventoryCollection({
        catalog,
        collection,
        runtime: 'reference',
      }),
    ).toEqual(collection);
    expect(
      validateInventoryCollection({
        catalog,
        collection: sandbox,
        runtime: 'react',
      }),
    ).toEqual(sandbox);
  });

  it('rejects an unavailable reference target', () => {
    const { catalog, collection } = collectReference();
    const [firstTarget, ...otherTargets] = collection.targets;
    const unavailableTarget = {
      ...firstTarget,
      status: 'uninspectable',
      reason: 'Factory unavailable',
      members: firstTarget.members.map((member) => ({
        ...member,
        observation: { shape: 'uninspectable', reason: 'Factory unavailable' },
      })),
    };
    expect(() =>
      validateInventoryCollection({
        catalog,
        collection: {
          ...collection,
          targets: [unavailableTarget, ...otherTargets],
        },
        runtime: 'reference',
      }),
    ).toThrow('Unavailable reference target: globalThis');
  });

  it('rejects a missing member in a collected reference target', () => {
    const { catalog, collection } = collectReference();
    const [firstTarget, ...otherTargets] = collection.targets;
    const [firstMember, ...otherMembers] = firstTarget.members;
    expect(() =>
      validateInventoryCollection({
        catalog,
        collection: {
          ...collection,
          targets: [
            {
              ...firstTarget,
              members: [
                { ...firstMember, observation: { shape: 'missing' } },
                ...otherMembers,
              ],
            },
            ...otherTargets,
          ],
        },
        runtime: 'reference',
      }),
    ).toThrow(`Invalid reference observation: ${firstMember.id}`);
  });

  it('rejects a member whose identifier does not match its key', () => {
    const { catalog, collection } = collectReference();
    const [firstTarget, ...otherTargets] = collection.targets;
    const [firstMember, ...otherMembers] = firstTarget.members;
    expect(() =>
      validateInventoryCollection({
        catalog,
        collection: {
          ...collection,
          targets: [
            {
              ...firstTarget,
              members: [
                { ...firstMember, id: 'globalThis.renamed' },
                ...otherMembers,
              ],
            },
            ...otherTargets,
          ],
        },
        runtime: 'reference',
      }),
    ).toThrow('Unexpected or duplicate member: globalThis.renamed');
  });

  it('rejects sandbox members that contradict their target status', () => {
    const { catalog } = collectReference();
    const { collection } = collectInventory({
      objects: OBJECTS,
      catalog,
      runtime: 'react',
    });
    const [firstTarget, ...otherTargets] = collection.targets;
    expect(() =>
      validateInventoryCollection({
        catalog,
        collection: {
          ...collection,
          targets: [
            { ...firstTarget, status: 'missing', reason: 'Target is absent' },
            ...otherTargets,
          ],
        },
        runtime: 'react',
      }),
    ).toThrow('Inconsistent target and member status');
  });

  it.each([
    { status: 'collected', reason: 'Unexpected reason' },
    { status: 'missing', reason: null },
  ])('rejects a $status target with reason $reason', (targetStatus) => {
    const { catalog, collection } = collectReference();
    const [firstTarget, ...otherTargets] = collection.targets;
    expect(() =>
      validateInventoryCollection({
        catalog,
        collection: {
          ...collection,
          targets: [{ ...firstTarget, ...targetStatus }, ...otherTargets],
        },
        runtime: 'reference',
      }),
    ).toThrow();
  });

  it('rejects a target whose kind differs from the catalog', () => {
    const { catalog, collection } = collectReference();
    expect(() =>
      validateInventoryCollection({
        catalog,
        collection: {
          ...collection,
          targets: collection.targets.map((result) =>
            result.target.kind === 'static'
              ? { ...result, target: { ...result.target, kind: 'namespace' } }
              : result,
          ),
        },
        runtime: 'reference',
      }),
    ).toThrow('Unexpected or duplicate target: globalThis.available');
  });
});
