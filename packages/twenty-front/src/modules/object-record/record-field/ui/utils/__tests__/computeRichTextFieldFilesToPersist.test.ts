import { computeRichTextFieldFilesToPersist } from '@/object-record/record-field/ui/utils/computeRichTextFieldFilesToPersist';

const LISTED_FILE = { fileId: 'listed-file-id', label: 'listed.png' };
const LISTED_FILE_FROM_SERVER = {
  ...LISTED_FILE,
  url: 'https://signed',
  extension: '.png',
};
const UPLOADED_FILE = { fileId: 'uploaded-file-id', label: 'uploaded.png' };

const buildDocument = (fileIds: string[]) =>
  JSON.stringify({
    type: 'doc',
    content: fileIds.map((fileId) => ({
      type: 'image',
      attrs: { src: `https://app.twenty.com/file/files-field/${fileId}` },
    })),
  });

describe('computeRichTextFieldFilesToPersist', () => {
  it('should add an uploaded file the document references to the listed files', () => {
    expect(
      computeRichTextFieldFilesToPersist({
        listedFiles: [LISTED_FILE_FROM_SERVER],
        uploadedFiles: [UPLOADED_FILE],
        serializedDocument: buildDocument([UPLOADED_FILE.fileId]),
      }),
    ).toEqual([LISTED_FILE, UPLOADED_FILE]);
  });

  it('should send nothing when the uploaded file is no longer in the document', () => {
    expect(
      computeRichTextFieldFilesToPersist({
        listedFiles: [LISTED_FILE],
        uploadedFiles: [UPLOADED_FILE],
        serializedDocument: buildDocument([LISTED_FILE.fileId]),
      }),
    ).toBeUndefined();
  });

  it('should send nothing when every uploaded file is already listed', () => {
    expect(
      computeRichTextFieldFilesToPersist({
        listedFiles: [LISTED_FILE, UPLOADED_FILE],
        uploadedFiles: [UPLOADED_FILE],
        serializedDocument: buildDocument([UPLOADED_FILE.fileId]),
      }),
    ).toBeUndefined();
  });

  it('should send nothing when a listed file leaves the document', () => {
    expect(
      computeRichTextFieldFilesToPersist({
        listedFiles: [LISTED_FILE],
        uploadedFiles: [],
        serializedDocument: buildDocument([]),
      }),
    ).toBeUndefined();
  });
});
