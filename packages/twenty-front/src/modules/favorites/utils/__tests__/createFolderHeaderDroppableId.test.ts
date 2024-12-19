import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';
import { createFolderHeaderDroppableId } from '../createFolderHeaderDroppableId';

describe('createFolderHeaderDroppableId', () => {
  it('should create a valid folder header droppable id', () => {
    const folderId = '123-456';
    const result = createFolderHeaderDroppableId(folderId);

    expect(result).toBe(
      `${FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX}${folderId}`,
    );
  });

  it('should work with empty string', () => {
    const result = createFolderHeaderDroppableId('');

    expect(result).toBe(FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX);
  });
});
