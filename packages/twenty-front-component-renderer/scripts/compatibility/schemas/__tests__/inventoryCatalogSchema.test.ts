import { collectInventory } from '../../utils/collectInventory';
import { inventoryCatalogSchema } from '../inventoryCatalogSchema';

const collectReferenceCatalog = () =>
  collectInventory({
    objects: {
      globalThis: { available: () => true },
      window: { available: () => true },
      factories: {
        'rendered.div': () => ({ tagName: 'DIV' }),
        'rendered.svg': () => ({ tagName: 'svg' }),
      },
    },
    runtime: 'reference',
  }).catalog;

const getIssueMessages = (catalog: unknown) =>
  inventoryCatalogSchema
    .safeParse(catalog)
    .error?.issues.map(({ message }) => message);

describe('inventoryCatalogSchema', () => {
  it('accepts a collected reference catalog', () => {
    expect(
      inventoryCatalogSchema.safeParse(collectReferenceCatalog()).success,
    ).toBe(true);
  });

  it('rejects a target listed twice with different members', () => {
    const catalog = collectReferenceCatalog();
    const [firstRequest] = catalog.targets;
    expect(
      getIssueMessages({
        ...catalog,
        targets: [
          ...catalog.targets,
          {
            target: firstRequest.target,
            keys: [{ kind: 'string', name: 'onlyInDuplicate' }],
          },
        ],
      }),
    ).toContain('Duplicate target or feature identifiers');
  });

  it('rejects a member listed twice in one target', () => {
    const catalog = collectReferenceCatalog();
    const [firstRequest, ...otherRequests] = catalog.targets;
    expect(
      getIssueMessages({
        ...catalog,
        targets: [
          {
            ...firstRequest,
            keys: [...firstRequest.keys, firstRequest.keys[0]],
          },
          ...otherRequests,
        ],
      }),
    ).toContain('Duplicate target or feature identifiers');
  });

  it('rejects a catalog without a required target', () => {
    const catalog = collectReferenceCatalog();
    expect(
      getIssueMessages({
        ...catalog,
        targets: catalog.targets.filter(
          ({ target }) =>
            !(target.kind === 'factory' && target.name === 'rendered.svg'),
        ),
      }),
    ).toContain('Missing required target: instance:rendered.svg');
  });
});
