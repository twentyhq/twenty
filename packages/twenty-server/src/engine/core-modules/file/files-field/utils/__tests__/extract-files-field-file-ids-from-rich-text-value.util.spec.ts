import { extractFilesFieldFileIdsFromRichTextValue } from 'src/engine/core-modules/file/files-field/utils/extract-files-field-file-ids-from-rich-text-value.util';

const FIRST_FILE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const SECOND_FILE_ID = '20202020-9e3b-46d4-a556-88b9ddc2b034';

const buildFileUrl = (fileId: string) =>
  `https://app.twenty.com/file/files-field/${fileId}`;

describe('extractFilesFieldFileIdsFromRichTextValue', () => {
  it('should extract the file ids of tiptap image and file nodes', () => {
    const tiptap = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'image', attrs: { src: buildFileUrl(FIRST_FILE_ID) } },
        {
          type: 'paragraph',
          content: [
            { type: 'file', attrs: { url: buildFileUrl(SECOND_FILE_ID) } },
          ],
        },
      ],
    });

    expect(
      extractFilesFieldFileIdsFromRichTextValue({
        tiptap,
        blocknote: null,
        markdown: null,
      }),
    ).toEqual(new Set([FIRST_FILE_ID, SECOND_FILE_ID]));
  });

  it('should extract file ids from blocknote blocks and deduplicate them', () => {
    expect(
      extractFilesFieldFileIdsFromRichTextValue({
        tiptap: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'image', attrs: { src: buildFileUrl(FIRST_FILE_ID) } },
          ],
        }),
        blocknote: JSON.stringify([
          {
            type: 'image',
            props: { url: `${buildFileUrl(FIRST_FILE_ID)}?token=signed` },
          },
          { type: 'file', props: { url: buildFileUrl(SECOND_FILE_ID) } },
        ]),
        markdown: null,
      }),
    ).toEqual(new Set([FIRST_FILE_ID, SECOND_FILE_ID]));
  });

  it('should ignore a file url that is only written as text or as a link', () => {
    expect(
      extractFilesFieldFileIdsFromRichTextValue({
        tiptap: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: buildFileUrl(FIRST_FILE_ID),
                  marks: [
                    {
                      type: 'link',
                      attrs: { href: buildFileUrl(FIRST_FILE_ID) },
                    },
                  ],
                },
              ],
            },
          ],
        }),
        blocknote: null,
        markdown: `![image](${buildFileUrl(FIRST_FILE_ID)})`,
      }),
    ).toEqual(new Set());
  });

  it('should ignore external urls, other file folders and malformed ids', () => {
    expect(
      extractFilesFieldFileIdsFromRichTextValue({
        tiptap: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'image', attrs: { src: 'https://example.com/logo.png' } },
            {
              type: 'image',
              attrs: {
                src: `https://app.twenty.com/file/core-picture/${FIRST_FILE_ID}`,
              },
            },
            {
              type: 'image',
              attrs: {
                src: 'https://app.twenty.com/file/files-field/not-a-uuid-not-a-uuid-not-a-uuid-not0',
              },
            },
          ],
        }),
      }),
    ).toEqual(new Set());
  });

  it.each([null, undefined])(
    'should return no file id for %j',
    (richTextValue) => {
      expect(extractFilesFieldFileIdsFromRichTextValue(richTextValue)).toEqual(
        new Set(),
      );
    },
  );
});
