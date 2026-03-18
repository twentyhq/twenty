import { getDropTargetIdFromDestination } from '@/navigation-menu-item/common/utils/getDropTargetIdFromDestination';

describe('getDropTargetIdFromDestination', () => {
  describe('workspace section', () => {
    it('should return null when destination is null or droppableId is not workspace', () => {
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'workspace',
          destination: null,
        }),
      ).toBe(null);
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'workspace',
          destination: { droppableId: 'favorite-orphan', index: 0 },
        }),
      ).toBe(null);
    });

    it('should return workspace-orphan-index for workspace orphan droppable', () => {
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'workspace',
          destination: {
            droppableId: 'workspace-orphan-navigation-menu-items',
            index: 2,
          },
        }),
      ).toBe('workspace-orphan-2');
    });

    it('should return workspace-folderId-index for workspace folder droppable', () => {
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'workspace',
          destination: {
            droppableId: 'workspace-folder-folder-123',
            index: 1,
          },
        }),
      ).toBe('workspace-folder-123-1');
    });

    it('should return workspace-folderId-index for workspace folder header droppable', () => {
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'workspace',
          destination: {
            droppableId: 'workspace-folder-header-folder-456',
            index: 0,
          },
        }),
      ).toBe('workspace-folder-456-0');
    });
  });

  describe('favorite section', () => {
    it('should return null when destination is null or droppableId is not favorite', () => {
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'favorite',
          destination: null,
        }),
      ).toBe(null);
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'favorite',
          destination: { droppableId: 'workspace-orphan', index: 0 },
        }),
      ).toBe(null);
    });

    it('should return favorite-orphan-index for favorite orphan droppable', () => {
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'favorite',
          destination: {
            droppableId: 'favorite-orphan-navigation-menu-items',
            index: 3,
          },
        }),
      ).toBe('favorite-orphan-3');
    });

    it('should return favorite-folderId-index for favorite folder droppable', () => {
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'favorite',
          destination: {
            droppableId: 'favorite-folder-abc-123',
            index: 1,
          },
        }),
      ).toBe('favorite-abc-123-1');
    });

    it('should return favorite-folderId-index for favorite folder header droppable', () => {
      expect(
        getDropTargetIdFromDestination({
          navigationMenuItemSection: 'favorite',
          destination: {
            droppableId: 'favorite-folder-header-def-456',
            index: 0,
          },
        }),
      ).toBe('favorite-def-456-0');
    });
  });
});
