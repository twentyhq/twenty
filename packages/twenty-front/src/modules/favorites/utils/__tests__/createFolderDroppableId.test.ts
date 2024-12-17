import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';
import { createFolderDroppableId } from '../createFolderDroppableId';

describe('createFolderDroppableId', () => {
  it('should create a valid folder droppable id', () => {
    const folderId = '123-456';
    const result = createFolderDroppableId(folderId);

    expect(result).toBe(`${FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX}${folderId}`);
  });

  it('should work with empty string', () => {
    const result = createFolderDroppableId('');

    expect(result).toBe(FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX);
  });
});
