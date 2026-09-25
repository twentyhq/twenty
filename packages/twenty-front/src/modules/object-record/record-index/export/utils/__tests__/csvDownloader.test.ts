import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { csvDownloader } from '@/object-record/record-index/export/utils/csvDownloader';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { saveAs } from 'file-saver';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

describe('csvDownloader', () => {
  const mockSaveAs = saveAs as jest.MockedFunction<typeof saveAs>;

  beforeEach(() => {
    mockSaveAs.mockClear();
  });

  const readBlob = async (blob: Blob): Promise<ArrayBuffer> =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
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
    csvDownloader('export.csv', {
      columns,
      rows: [{ id: '1', name: 'test' }],
    });

    const blob = mockSaveAs.mock.calls[0][0] as Blob;
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
    csvDownloader('export.csv', { columns, rows: [{ id: '1', name }] });

    const blob = mockSaveAs.mock.calls[0][0] as Blob;
    const text = Buffer.from(await readBlob(blob)).toString('utf-8');

    expect(text).toContain(name);
  });

  it('downloads raw records with shared currency and relation formatting', async () => {
    csvDownloader('export.csv', {
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

    const blob = mockSaveAs.mock.calls[0][0] as Blob;

    expect(Buffer.from(await readBlob(blob)).toString('utf-8')).toBe(
      '\uFEFFId,Amount / Amount,Amount / Currency,Company Id\n1,,,\n2,1.5,EUR,company-1\n',
    );
  });
});
