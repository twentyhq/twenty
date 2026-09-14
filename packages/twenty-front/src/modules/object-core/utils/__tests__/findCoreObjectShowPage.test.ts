import { CoreObjectNameSingular } from 'twenty-shared/types';

import { findCoreObjectShowPage } from '@/object-core/utils/findCoreObjectShowPage';

describe('findCoreObjectShowPage', () => {
  it('resolves a page for an object owned by core', () => {
    expect(
      findCoreObjectShowPage(CoreObjectNameSingular.Workflow),
    ).toBeDefined();
  });

  it('resolves nothing for a workspace-owned object', () => {
    expect(
      findCoreObjectShowPage(CoreObjectNameSingular.Person),
    ).toBeUndefined();
  });

  it('resolves nothing without an object name', () => {
    expect(findCoreObjectShowPage(undefined)).toBeUndefined();
    expect(findCoreObjectShowPage(null)).toBeUndefined();
  });
});
