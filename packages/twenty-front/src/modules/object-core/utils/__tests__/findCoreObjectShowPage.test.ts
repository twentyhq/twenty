import { StandardObjectNameSingular } from 'twenty-shared/types';

import { findCoreObjectShowPage } from '@/object-core/utils/findCoreObjectShowPage';

describe('findCoreObjectShowPage', () => {
  it('resolves a page for an object owned by core', () => {
    expect(
      findCoreObjectShowPage(StandardObjectNameSingular.Workflow),
    ).toBeDefined();
  });

  it('resolves nothing for a workspace-owned object', () => {
    expect(
      findCoreObjectShowPage(StandardObjectNameSingular.Person),
    ).toBeUndefined();
  });

  it('resolves nothing without an object name', () => {
    expect(findCoreObjectShowPage(undefined)).toBeUndefined();
    expect(findCoreObjectShowPage(null)).toBeUndefined();
  });

  it('resolves nothing for object prototype members reachable from the route', () => {
    for (const objectNameSingular of [
      'constructor',
      'toString',
      'valueOf',
      'hasOwnProperty',
      '__proto__',
    ]) {
      expect(findCoreObjectShowPage(objectNameSingular)).toBeUndefined();
    }
  });
});
