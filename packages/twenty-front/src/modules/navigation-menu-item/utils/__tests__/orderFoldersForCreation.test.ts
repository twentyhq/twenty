import { orderFoldersForCreation } from '@/navigation-menu-item/utils/orderFoldersForCreation';

describe('orderFoldersForCreation', () => {
  it('returns empty array for empty input', () => {
    expect(orderFoldersForCreation([], new Set())).toEqual([]);
  });

  it('orders so parent folders come before their children', () => {
    const parent = { id: 'parent', folderId: null };
    const child = { id: 'child', folderId: 'parent' };
    expect(orderFoldersForCreation([child, parent], new Set())).toEqual([
      parent,
      child,
    ]);
  });

  it('treats folderId in existingIds as already created so child can be placed', () => {
    const child = { id: 'child', folderId: 'existing-parent' };
    expect(
      orderFoldersForCreation([child], new Set(['existing-parent'])),
    ).toEqual([child]);
  });

  it('orders multiple levels: root first, then children in dependency order', () => {
    const a = { id: 'a', folderId: undefined };
    const b = { id: 'b', folderId: 'a' };
    const c = { id: 'c', folderId: 'b' };
    expect(orderFoldersForCreation([c, a, b], new Set())).toEqual([a, b, c]);
  });

  it('leaves out folders whose parent is missing and not in existingIds', () => {
    const child = { id: 'child', folderId: 'missing-parent' };
    expect(orderFoldersForCreation([child], new Set())).toEqual([]);
  });
});
