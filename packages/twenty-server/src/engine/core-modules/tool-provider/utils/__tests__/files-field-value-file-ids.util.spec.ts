import {
  collectFileIdsFromFilesFieldValue,
  substituteFileIdsInFilesFieldValue,
} from 'src/engine/core-modules/tool-provider/utils/files-field-value-file-ids.util';

describe('collectFileIdsFromFilesFieldValue', () => {
  it('should collect fileIds from a files field value', () => {
    expect(
      collectFileIdsFromFilesFieldValue([
        { fileId: 'file-1', label: 'a.pdf' },
        { fileId: 'file-2' },
      ]),
    ).toEqual(['file-1', 'file-2']);
  });

  it('should ignore non-array values and malformed entries', () => {
    expect(collectFileIdsFromFilesFieldValue(undefined)).toEqual([]);
    expect(collectFileIdsFromFilesFieldValue('file-1')).toEqual([]);
    expect(
      collectFileIdsFromFilesFieldValue([
        null,
        'file-1',
        { label: 'no-id.pdf' },
        { fileId: '' },
        { fileId: 'file-2' },
      ]),
    ).toEqual(['file-2']);
  });
});

describe('substituteFileIdsInFilesFieldValue', () => {
  it('should swap substituted fileIds and keep other entry fields', () => {
    const result = substituteFileIdsInFilesFieldValue(
      [
        { fileId: 'chat-file', label: 'contract.pdf' },
        { fileId: 'already-prepared', label: 'other.pdf' },
      ],
      new Map([['chat-file', 'copied-file']]),
    );

    expect(result).toEqual([
      { fileId: 'copied-file', label: 'contract.pdf' },
      { fileId: 'already-prepared', label: 'other.pdf' },
    ]);
  });

  it('should return non-array values untouched', () => {
    expect(substituteFileIdsInFilesFieldValue('not-an-array', new Map())).toBe(
      'not-an-array',
    );
  });
});
