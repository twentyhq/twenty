import { FieldMetadataType } from 'twenty-shared/types';

import { buildTipTapRichTextColumnTargets } from 'src/database/commands/upgrade-version-command/2-42/utils/build-tiptap-rich-text-column-targets.util';

const computeColumnName = (fieldName: string, subFieldName: string) =>
  `${fieldName}${subFieldName.charAt(0).toUpperCase()}${subFieldName.slice(1)}`;

describe('buildTipTapRichTextColumnTargets', () => {
  it('should target the blocknote and markdown columns of every rich text field', () => {
    const targets = buildTipTapRichTextColumnTargets({
      flatObjectMetadatas: [
        {
          universalIdentifier: 'task',
          isRemote: false,
          fieldUniversalIdentifiers: ['body', 'title'],
        },
      ],
      flatFieldMetadataByUniversalIdentifier: {
        body: { type: FieldMetadataType.RICH_TEXT, name: 'bodyV2' },
        title: { type: FieldMetadataType.TEXT, name: 'title' },
      },
      computeColumnName,
    });

    expect(targets).toEqual([
      {
        objectMetadataUniversalIdentifier: 'task',
        blocknoteColumnName: 'bodyV2Blocknote',
        markdownColumnName: 'bodyV2Markdown',
      },
    ]);
  });

  it('should skip remote objects', () => {
    const targets = buildTipTapRichTextColumnTargets({
      flatObjectMetadatas: [
        {
          universalIdentifier: 'remote',
          isRemote: true,
          fieldUniversalIdentifiers: ['body'],
        },
      ],
      flatFieldMetadataByUniversalIdentifier: {
        body: { type: FieldMetadataType.RICH_TEXT, name: 'bodyV2' },
      },
      computeColumnName,
    });

    expect(targets).toEqual([]);
  });

  it('should skip fields missing from the maps', () => {
    const targets = buildTipTapRichTextColumnTargets({
      flatObjectMetadatas: [
        {
          universalIdentifier: 'task',
          isRemote: false,
          fieldUniversalIdentifiers: ['ghost'],
        },
      ],
      flatFieldMetadataByUniversalIdentifier: {},
      computeColumnName,
    });

    expect(targets).toEqual([]);
  });
});
