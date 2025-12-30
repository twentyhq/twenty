import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';
import { validateAndExtractFolderId } from '@/favorites/utils/validateAndExtractFolderId';

describe('validateAndExtractFolderId', () => {
  it('should return null for orphan favorites', () => {
    const result = validateAndExtractFolderId(
      FAVORITE_DROPPABLE_IDS.ORPHAN_FAVORITES,
    );
    expect(result).toBeNull();
  });

  it('should extract folder id from folder droppable id', () => {
    const folderId = '123-456';
    const droppableId = `${FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX}${folderId}`;

    const result = validateAndExtractFolderId(droppableId);
    expect(result).toBe(folderId);
  });

  it('should extract folder id from folder header droppable id', () => {
    const folderId = '123-456';
    const droppableId = `${FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX}${folderId}`;

    const result = validateAndExtractFolderId(droppableId);
    expect(result).toBe(folderId);
  });

  it('should throw error for invalid droppable id format', () => {
    expect(() => {
      validateAndExtractFolderId('invalid-id');
    }).toThrow('Invalid droppable ID format: invalid-id');
  });

  it('should throw error for empty folder id in folder format', () => {
    expect(() => {
      validateAndExtractFolderId(FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX);
    }).toThrow(`Invalid folder ID: ${FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX}`);
  });

  it('should throw error for empty folder id in folder header format', () => {
    expect(() => {
      validateAndExtractFolderId(FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX);
    }).toThrow(
      `Invalid folder header ID: ${FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX}`,
    );
  });
});
