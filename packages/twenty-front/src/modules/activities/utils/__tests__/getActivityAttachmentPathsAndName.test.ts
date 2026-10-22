import { type JSONContent } from '@tiptap/core';

import { getActivityAttachmentPathsAndName } from '@/activities/utils/getActivityAttachmentPathsAndName';

const buildDocument = (content: JSONContent[]) =>
  JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 }, content });

describe('getActivityAttachmentPathsAndName', () => {
  it('should return the file paths and names from the activity document', () => {
    const attachmentPathsAndNames = getActivityAttachmentPathsAndName(
      buildDocument([
        { type: 'paragraph', content: [{ type: 'text', text: 'test' }] },
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/files/image/image.jpg?queryParam=value',
            alt: 'image',
          },
        },
        {
          type: 'file',
          attrs: {
            url: 'https://example.com/files/file/file.pdf?queryParam=value',
            name: 'file',
          },
        },
      ]),
    );

    expect(attachmentPathsAndNames).toEqual([
      {
        path: 'https://example.com/files/image/image.jpg?queryParam=value',
        name: 'image',
      },
      {
        path: 'https://example.com/files/file/file.pdf?queryParam=value',
        name: 'file',
      },
    ]);
  });

  it('should find attachments nested in other nodes', () => {
    const attachmentPathsAndNames = getActivityAttachmentPathsAndName(
      buildDocument([
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'file',
                  attrs: { url: 'https://example.com/a.pdf', name: 'a' },
                },
              ],
            },
          ],
        },
      ]),
    );

    expect(attachmentPathsAndNames).toEqual([
      { path: 'https://example.com/a.pdf', name: 'a' },
    ]);
  });

  it('should ignore attachments without a url', () => {
    const attachmentPathsAndNames = getActivityAttachmentPathsAndName(
      buildDocument([
        { type: 'image', attrs: { src: '', alt: 'empty' } },
        { type: 'file', attrs: { name: 'missing' } },
      ]),
    );

    expect(attachmentPathsAndNames).toEqual([]);
  });

  it('should return no attachments for a body that is not a TipTap document', () => {
    expect(getActivityAttachmentPathsAndName('')).toEqual([]);
    expect(getActivityAttachmentPathsAndName('[{"type":"image"}]')).toEqual([]);
  });
});
