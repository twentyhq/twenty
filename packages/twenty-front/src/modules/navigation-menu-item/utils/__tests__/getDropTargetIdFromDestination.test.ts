import { getDropTargetIdFromDestination } from '@/navigation-menu-item/utils/getDropTargetIdFromDestination';

describe('getDropTargetIdFromDestination', () => {
  it('should return null when destination is null or droppableId is not workspace', () => {
    expect(getDropTargetIdFromDestination(null)).toBe(null);
    expect(
      getDropTargetIdFromDestination({
        droppableId: 'favorites-orphan',
        index: 0,
      }),
    ).toBe(null);
  });

  it('should return workspace-orphan-index for workspace orphan droppable', () => {
    const result = getDropTargetIdFromDestination({
      droppableId: 'workspace-orphan-navigation-menu-items',
      index: 2,
    });
    expect(result).toBe('workspace-orphan-2');
  });

  it('should return workspace-folderId-index for workspace folder droppable', () => {
    const result = getDropTargetIdFromDestination({
      droppableId: 'workspace-folder-folder-123',
      index: 1,
    });
    expect(result).toBe('workspace-folder-123-1');
  });

  it('should return workspace-folderId-index for workspace folder header droppable', () => {
    const result = getDropTargetIdFromDestination({
      droppableId: 'workspace-folder-header-folder-456',
      index: 0,
    });
    expect(result).toBe('workspace-folder-456-0');
  });
});
