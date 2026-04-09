import { buildGmailLabelSearchName } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-label-search-name.util';

describe('buildGmailLabelSearchName', () => {
  it('should return null for folder without name', () => {
    const result = buildGmailLabelSearchName(
      { externalId: 'Label_1', name: '', parentFolderId: null },
      [],
    );

    expect(result).toBeNull();
  });

  it('should convert spaces to hyphens and lowercase', () => {
    const folder = {
      externalId: 'Label_1',
      name: 'My Custom Folder',
      parentFolderId: null,
    };

    const result = buildGmailLabelSearchName(folder, [folder]);

    expect(result).toBe('my-custom-folder');
  });

  it('should build full path for nested folder', () => {
    const parent = {
      externalId: 'Label_parent',
      name: 'Work',
      parentFolderId: null,
    };
    const child = {
      externalId: 'Label_child',
      name: 'Projects',
      parentFolderId: 'Label_parent',
    };
    const allFolders = [parent, child];

    const result = buildGmailLabelSearchName(child, allFolders);

    expect(result).toBe('work-projects');
  });

  it('should handle deeply nested folders', () => {
    const grandparent = {
      externalId: 'L1',
      name: 'Work',
      parentFolderId: null,
    };
    const parent = { externalId: 'L2', name: 'Projects', parentFolderId: 'L1' };
    const child = { externalId: 'L3', name: 'Active', parentFolderId: 'L2' };

    const result = buildGmailLabelSearchName(child, [
      grandparent,
      parent,
      child,
    ]);

    expect(result).toBe('work-projects-active');
  });
});
