import { buildShahryarReportCsv } from '@/shahryar/utils/exportShahryarReport';
import { type ShahryarReportRow } from '@/shahryar/utils/shahryarReportUtils';

describe('exportShahryarReport', () => {
  it('formats report rows as Excel-compatible CSV with escaped cells', () => {
    const rows: ShahryarReportRow[] = [
      {
        period: 'ڕۆژانە',
        visits: 3,
        salesCartons: 53,
        requests: 18,
        primaryInsight: '3 سەردان',
        secondaryInsight: '18 داواکاری',
        notes: 'کێشەی "قەرز" هەیە',
      },
    ];

    expect(buildShahryarReportCsv(rows)).toBe(
      [
        '"Period","Visits","Sales cartons","Requests","Primary insight","Secondary insight","Notes"',
        '"ڕۆژانە","3","53","18","3 سەردان","18 داواکاری","کێشەی ""قەرز"" هەیە"',
      ].join('\n'),
    );
  });
});
