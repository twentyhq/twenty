import { transformRichTextFieldValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-field-value.util';

const FILES = [{ fileId: 'file-id', label: 'notes.txt' }];

describe('transformRichTextFieldValue', () => {
  it('should keep the listed files next to the normalized text', () => {
    expect(
      transformRichTextFieldValue({ markdown: 'Notes', files: FILES }),
    ).toMatchObject({ markdown: 'Notes', files: FILES });
  });

  it('should not add a files key to a value that lists none', () => {
    expect(
      transformRichTextFieldValue({ markdown: 'Notes' }),
    ).not.toHaveProperty('files');
  });
});
