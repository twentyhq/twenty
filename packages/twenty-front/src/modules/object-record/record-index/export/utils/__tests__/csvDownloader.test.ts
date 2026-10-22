import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { csvDownloader } from '@/object-record/record-index/export/utils/csvDownloader';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES } from '@/settings/data-model/constants/CompositeFieldSubFieldLabelMessages';
import { i18n } from '@lingui/core';
import { saveAs } from 'file-saver';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

describe('csvDownloader', () => {
  const mockSaveAs = jest.mocked(saveAs);

  beforeEach(() => {
    mockSaveAs.mockClear();
  });

  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  const getDownloadedBlob = () => {
    const blob = mockSaveAs.mock.calls[0][0];

    if (!(blob instanceof Blob)) {
      throw new Error('Expected the downloaded file to be a Blob');
    }

    return blob;
  };

  const readBlob = async (blob: Blob): Promise<ArrayBuffer> =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (!(reader.result instanceof ArrayBuffer)) {
          reject(new Error('Expected the file contents to be an ArrayBuffer'));

          return;
        }

        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

  const columns: Pick<
    ColumnDefinition<FieldMetadata>,
    'size' | 'label' | 'type' | 'metadata'
  >[] = [
    {
      label: 'Name',
      size: 100,
      type: FieldMetadataType.TEXT,
      metadata: { fieldName: 'name' },
    },
  ];

  it('prepends UTF-8 BOM (EF BB BF) as first three bytes', async () => {
    csvDownloader({
      filename: 'export.csv',
      objectMetadataItems: [],
      columns,
      rows: [{ id: '1', name: 'test' }],
    });

    const blob = getDownloadedBlob();
    const bytes = new Uint8Array(await readBlob(blob));

    expect(bytes[0]).toBe(0xef);
    expect(bytes[1]).toBe(0xbb);
    expect(bytes[2]).toBe(0xbf);
    expect(blob.type).toBe('text/csv');
    expect(mockSaveAs).toHaveBeenCalledWith(blob, 'export.csv');
  });

  it.each([
    ['Arabic', 'مرحبا'],
    ['Chinese', '你好'],
    ['Japanese', 'こんにちは'],
    ['Korean', '안녕하세요'],
  ])('preserves %s characters in exported content', async (_, name) => {
    csvDownloader({
      filename: 'export.csv',
      objectMetadataItems: [],
      columns,
      rows: [{ id: '1', name }],
    });

    const blob = getDownloadedBlob();
    const text = Buffer.from(await readBlob(blob)).toString('utf-8');

    expect(text).toContain(name);
  });

  it('preserves translated composite headers and relation ID headers', async () => {
    const messages =
      COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES[FieldMetadataType.FULL_NAME];
    i18n.load('fr-FR', {
      [messages.firstName.id ?? '']: 'Prénom',
      [messages.lastName.id ?? '']: 'Nom de famille',
    });
    i18n.activate('fr-FR');

    csvDownloader({
      filename: 'export.csv',
      objectMetadataItems: [],
      columns: [
        {
          label: 'Nom',
          type: FieldMetadataType.FULL_NAME,
          metadata: { fieldName: 'name' },
        },
        {
          label: 'Entreprise',
          type: FieldMetadataType.RELATION,
          metadata: {
            fieldName: 'company',
            relationType: RelationType.MANY_TO_ONE,
          },
        },
      ],
      rows: [
        {
          id: '1',
          name: { firstName: 'Ada', lastName: 'Lovelace' },
          companyId: 'company-1',
        },
      ],
    });

    const blob = getDownloadedBlob();

    expect(Buffer.from(await readBlob(blob)).toString('utf-8')).toBe(
      '\uFEFFId,Nom / Prénom,Nom / Nom de famille,Entreprise Id\n1,Ada,Lovelace,company-1\n',
    );
  });

  it('downloads raw records with shared currency and relation formatting', async () => {
    csvDownloader({
      filename: 'export.csv',
      objectMetadataItems: [],
      columns: [
        {
          label: 'Amount',
          type: FieldMetadataType.CURRENCY,
          metadata: { fieldName: 'amount' },
        },
        {
          label: 'Company',
          type: FieldMetadataType.RELATION,
          metadata: {
            fieldName: 'company',
            relationType: RelationType.MANY_TO_ONE,
          },
        },
        {
          label: 'Opportunities',
          type: FieldMetadataType.RELATION,
          metadata: {
            fieldName: 'opportunities',
            relationType: RelationType.ONE_TO_MANY,
          },
        },
      ],
      rows: [
        { id: '1', amount: null, companyId: null },
        {
          id: '2',
          amount: { amountMicros: 1500000, currencyCode: 'EUR' },
          companyId: 'company-1',
        },
      ],
    });

    const blob = getDownloadedBlob();

    expect(Buffer.from(await readBlob(blob)).toString('utf-8')).toBe(
      '\uFEFFId,Amount / Amount,Amount / Currency,Company Id\n1,,,\n2,1.5,EUR,company-1\n',
    );
  });

  it('exports one join column per morph relation target', async () => {
    csvDownloader({
      filename: 'export.csv',
      objectMetadataItems: [
        { id: 'company-object-id', labelSingular: 'Company' },
        { id: 'person-object-id', labelSingular: 'Person' },
      ],
      columns: [
        {
          label: 'Target',
          type: FieldMetadataType.MORPH_RELATION,
          metadata: {
            fieldName: 'target',
            relationType: RelationType.MANY_TO_ONE,
            morphRelations: [
              {
                type: RelationType.MANY_TO_ONE,
                sourceFieldMetadata: { id: 'source-field-id', name: 'target' },
                targetFieldMetadata: { id: 'company-field-id', name: 'notes' },
                sourceObjectMetadata: {
                  id: 'note-object-id',
                  nameSingular: 'note',
                  namePlural: 'notes',
                },
                targetObjectMetadata: {
                  id: 'company-object-id',
                  nameSingular: 'company',
                  namePlural: 'companies',
                },
              },
              {
                type: RelationType.MANY_TO_ONE,
                sourceFieldMetadata: { id: 'source-field-id', name: 'target' },
                targetFieldMetadata: { id: 'person-field-id', name: 'notes' },
                sourceObjectMetadata: {
                  id: 'note-object-id',
                  nameSingular: 'note',
                  namePlural: 'notes',
                },
                targetObjectMetadata: {
                  id: 'person-object-id',
                  nameSingular: 'person',
                  namePlural: 'people',
                },
              },
            ],
          },
        },
      ],
      rows: [{ id: '1', targetCompanyId: 'company-1', targetPersonId: null }],
    });

    const blob = getDownloadedBlob();

    expect(Buffer.from(await readBlob(blob)).toString('utf-8')).toBe(
      '\uFEFFId,Target / Company Id,Target / Person Id\n1,company-1,\n',
    );
  });
});
