import {
  matchesWorkspaceFolderId,
  validateAndExtractWorkspaceFolderId,
} from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

describe('matchesWorkspaceFolderId', () => {
  it('should return true when folderId and item folder match (including null for orphan)', () => {
    expect(
      matchesWorkspaceFolderId({ folderId: null } as NavigationMenuItem, null),
    ).toBe(true);
    expect(matchesWorkspaceFolderId({} as NavigationMenuItem, null)).toBe(true);
    expect(
      matchesWorkspaceFolderId({ folderId: 'f1' } as NavigationMenuItem, 'f1'),
    ).toBe(true);
  });

  it('should return false when folderId and item folder do not match', () => {
    expect(
      matchesWorkspaceFolderId({ folderId: 'f1' } as NavigationMenuItem, null),
    ).toBe(false);
    expect(
      matchesWorkspaceFolderId({ folderId: 'f1' } as NavigationMenuItem, 'f2'),
    ).toBe(false);
  });
});

describe('validateAndExtractWorkspaceFolderId', () => {
  it('should return null for orphan and extract folder id from header or folder prefix', () => {
    expect(
      validateAndExtractWorkspaceFolderId(
        'workspace-orphan-navigation-menu-items',
      ),
    ).toBe(null);
    expect(
      validateAndExtractWorkspaceFolderId('workspace-folder-header-folder-123'),
    ).toBe('folder-123');
    expect(
      validateAndExtractWorkspaceFolderId('workspace-folder-folder-456'),
    ).toBe('folder-456');
  });

  it('should throw for invalid or empty folder id after prefix', () => {
    expect(() =>
      validateAndExtractWorkspaceFolderId('workspace-folder-header-'),
    ).toThrow('Invalid workspace folder header ID');
    expect(() =>
      validateAndExtractWorkspaceFolderId('workspace-folder-'),
    ).toThrow('Invalid workspace folder ID');
    expect(() =>
      validateAndExtractWorkspaceFolderId('invalid-droppable-id'),
    ).toThrow('Invalid workspace droppable ID format');
  });
});
