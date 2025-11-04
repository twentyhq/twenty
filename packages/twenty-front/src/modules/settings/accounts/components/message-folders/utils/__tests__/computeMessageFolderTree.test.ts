import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { computeMessageFolderTree } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';

describe('computeMessageFolderTree', () => {
  const createFolder = (
    id: string,
    name: string,
    parentFolderId: string | null = null,
    externalId: string | null = null,
  ): MessageFolder => ({
    id,
    name,
    parentFolderId,
    externalId: externalId || id,
    isSentFolder: false,
    isSynced: false,
    messageChannelId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    __typename: 'MessageFolder',
    syncCursor: '',
  });

  it('should return empty array for empty input', () => {
    expect(computeMessageFolderTree([])).toEqual([]);
  });

  it('should return single root folder without children', () => {
    const folder = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449b1',
      'Inbox',
      null,
    );
    const result = computeMessageFolderTree([folder]);

    expect(result).toHaveLength(1);
    expect(result[0].folder).toEqual(folder);
    expect(result[0].hasChildren).toBe(false);
    expect(result[0].children).toEqual([]);
  });

  it('should organize parent-child relationship', () => {
    const parent = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449b2',
      'Work',
      null,
      'ext-parent-id',
    );
    const child = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449b3',
      'Projects',
      'ext-parent-id',
      'ext-child-id',
    );
    const result = computeMessageFolderTree([parent, child]);

    expect(result).toHaveLength(1);
    expect(result[0].folder.name).toBe('Work');
    expect(result[0].hasChildren).toBe(true);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].folder.name).toBe('Projects');
  });

  it('should handle multiple levels of nesting', () => {
    const grandparent = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449b4',
      'Work',
      null,
      'ext-grandparent-id',
    );
    const parent = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449b5',
      'Projects',
      'ext-grandparent-id',
      'ext-parent-id',
    );
    const child = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449b6',
      '2024',
      'ext-parent-id',
      'ext-child-id',
    );
    const result = computeMessageFolderTree([grandparent, parent, child]);

    expect(result[0].folder.name).toBe('Work');
    expect(result[0].children[0].folder.name).toBe('Projects');
    expect(result[0].children[0].children[0].folder.name).toBe('2024');
  });

  it('should sort root folders alphabetically', () => {
    const folders = [
      createFolder('20202020-7cf8-40bc-a681-b80b771449b7', 'Sent', null),
      createFolder('20202020-7cf8-40bc-a681-b80b771449b8', 'Inbox', null),
      createFolder('20202020-7cf8-40bc-a681-b80b771449b9', 'Drafts', null),
    ];
    const result = computeMessageFolderTree(folders);

    expect(result[0].folder.name).toBe('Drafts');
    expect(result[1].folder.name).toBe('Inbox');
    expect(result[2].folder.name).toBe('Sent');
  });

  it('should sort children alphabetically', () => {
    const parent = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449c0',
      'Work',
      null,
      'ext-parent-id',
    );
    const child1 = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449c1',
      'Zebra',
      'ext-parent-id',
      'ext-child1-id',
    );
    const child2 = createFolder(
      '20202020-7cf8-40bc-a681-b80b771449c2',
      'Apple',
      'ext-parent-id',
      'ext-child2-id',
    );
    const result = computeMessageFolderTree([parent, child1, child2]);

    expect(result[0].children[0].folder.name).toBe('Apple');
    expect(result[0].children[1].folder.name).toBe('Zebra');
  });

  it('should treat orphaned folders as root folders', () => {
    const orphan = createFolder('o', 'Orphan', 'non-existent', 'ext-o');
    const normal = createFolder('n', 'Normal', null, 'ext-n');
    const result = computeMessageFolderTree([orphan, normal]);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.folder.name).sort()).toEqual([
      'Normal',
      'Orphan',
    ]);
  });

  it('should handle Gmail-style nested labels', () => {
    const work = createFolder('1', 'Work', null, 'ext-work');
    const projects = createFolder('2', 'Projects', 'ext-work', 'ext-proj');
    const clients = createFolder('3', 'Clients', 'ext-work', 'ext-cli');
    const result = computeMessageFolderTree([work, projects, clients]);

    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(2);
    expect(result[0].children[0].folder.name).toBe('Clients');
    expect(result[0].children[1].folder.name).toBe('Projects');
  });
});
