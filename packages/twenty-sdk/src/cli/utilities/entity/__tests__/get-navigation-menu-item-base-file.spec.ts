import { getNavigationMenuItemBaseFile } from '@/cli/utilities/entity/entity-navigation-menu-item-template';

describe('getNavigationMenuItemBaseFile', () => {
  it('should render proper file using defineNavigationMenuItem', () => {
    const result = getNavigationMenuItemBaseFile({
      name: 'my-nav-item',
      universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
    });

    expect(result).toContain(
      "import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';",
    );
    expect(result).toContain('export default defineNavigationMenuItem({');
    expect(result).toContain(
      "universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4'",
    );
    expect(result).toContain("name: 'my-nav-item'");
    expect(result).toContain("icon: 'IconList'");
    expect(result).toContain('position: 0');
  });

  it('should include viewUniversalIdentifier when type is VIEW', () => {
    const result = getNavigationMenuItemBaseFile({
      name: 'linked-item',
      type: 'VIEW',
      viewUniversalIdentifier: 'view-uuid-123',
    });

    expect(result).toContain('type: NavigationMenuItemType.VIEW');
    expect(result).toContain("viewUniversalIdentifier: 'view-uuid-123'");
  });

  it('should default to VIEW type when no type is provided', () => {
    const result = getNavigationMenuItemBaseFile({
      name: 'unlinked-item',
    });

    expect(result).toContain('type: NavigationMenuItemType.VIEW');
    expect(result).toContain('// viewUniversalIdentifier:');
  });

  it('should include targetObjectUniversalIdentifier when type is OBJECT', () => {
    const result = getNavigationMenuItemBaseFile({
      name: 'object-item',
      type: 'OBJECT',
      targetObjectUniversalIdentifier: 'obj-uuid-123',
    });

    expect(result).toContain('type: NavigationMenuItemType.OBJECT');
    expect(result).toContain("targetObjectUniversalIdentifier: 'obj-uuid-123'");
  });

  it('should generate unique UUID when not provided', () => {
    const result = getNavigationMenuItemBaseFile({
      name: 'auto-uuid-nav',
    });

    expect(result).toMatch(
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should use kebab-case for name', () => {
    const result = getNavigationMenuItemBaseFile({
      name: 'dashboard overview',
    });

    expect(result).toContain("name: 'dashboard-overview'");
  });
});
