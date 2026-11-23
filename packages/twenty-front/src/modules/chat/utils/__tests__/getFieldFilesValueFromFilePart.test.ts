import { FILE_CATEGORIES } from 'twenty-shared/types';

import { getFieldFilesValueFromFilePart } from '@/chat/utils/getFieldFilesValueFromFilePart';
import { getFieldFilesValueCategory } from '@/object-record/record-field/ui/utils/getFieldFilesValueCategory';

describe('getFieldFilesValueFromFilePart', () => {
  it('maps an uploaded screenshot to an image file value', () => {
    const fileValue = getFieldFilesValueFromFilePart({
      type: 'file',
      fileId: 'file-id',
      filename: 'Screenshot 2026-11-10.png',
      mediaType: 'image/png',
      url: 'https://api.example.com/file/agent-chat/file-id?token=token',
    });

    expect(fileValue).toEqual({
      fileId: 'file-id',
      label: 'Screenshot 2026-11-10.png',
      extension: '.png',
      url: 'https://api.example.com/file/agent-chat/file-id?token=token',
    });
    expect(getFieldFilesValueCategory(fileValue)).toBe(FILE_CATEGORIES.IMAGE);
  });

  it('keeps a part without a filename as a non-image file', () => {
    const fileValue = getFieldFilesValueFromFilePart({
      type: 'file',
      fileId: 'file-id',
      mediaType: 'application/octet-stream',
      url: '',
    });

    expect(fileValue.label).toBe('');
    expect(getFieldFilesValueCategory(fileValue)).toBe(FILE_CATEGORIES.OTHER);
  });
});
