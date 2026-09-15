import canonicalCatalog from 'src/engine/metadata-modules/ai/ai-models/ai-models.json';
import shippedCatalog from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import selfHostSpec from 'src/engine/metadata-modules/ai/ai-models/ai-self-host-spec.json';

import { type CatalogSpec } from '../types/catalog-spec.type';
import {
  type CanonicalCatalog,
  projectCatalog,
} from '../utils/project-catalog.util';

// The shipped catalog is generated, and a hand edit to it is the drift this
// pipeline exists to remove, so it has to stay what its spec produces.
describe('the shipped catalog', () => {
  it('is what the self-host spec projects from the model catalog', () => {
    const projected = projectCatalog({
      canonicalCatalog: canonicalCatalog as CanonicalCatalog,
      spec: selfHostSpec as CatalogSpec,
    });

    expect(projected).toEqual(shippedCatalog);
  });
});
