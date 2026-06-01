import { SHAHRYAR_REPORT_DATA } from '@/shahryar/constants/shahryar-report-data';
import { SHAHRYAR_REPORT_INPUT } from '@/shahryar/constants/shahryar-report-source-data';
import {
  buildShahryarNotifications,
  buildShahryarReportData,
} from '@/shahryar/utils/shahryarReportUtils';

describe('shahryarReportUtils', () => {
  it('aggregates dashboard metrics from Shahryar source records', () => {
    const reportData = buildShahryarReportData({
      data: SHAHRYAR_REPORT_INPUT.sourceData,
      referenceDate: SHAHRYAR_REPORT_INPUT.referenceDate,
    });

    expect(reportData.dashboardMetrics).toEqual(
      expect.arrayContaining([
        { label: 'ژمارەی مارکێتەکان', value: '4', trend: 'چالاک' },
        { label: 'ژمارەی سەردانەکان', value: '3', trend: 'ئەمڕۆ' },
        { label: 'موشریفە چالاکەکان', value: '4', trend: 'ئەمڕۆ' },
        { label: 'فرۆشتن و داواکاری', value: '53/18', trend: 'مانگانە' },
        { label: 'پارەدان', value: '50%', trend: 'ڕێژەی داخراو' },
        {
          label: 'غرامەی موشریفەکان',
          value: '2',
          trend: 'ئەم هەفتەیە',
        },
        { label: 'غیابات', value: '2', trend: 'ئەم هەفتەیە' },
        { label: 'باک ئەپ', value: 'سەرکەوتوو', trend: 'ئەمڕۆ 02:15' },
      ]),
    );
  });

  it('builds daily, weekly, and monthly report rows', () => {
    expect(SHAHRYAR_REPORT_DATA.reportRows).toEqual([
      {
        period: 'ڕۆژانە',
        visits: 3,
        salesCartons: 53,
        requests: 18,
        notes: 'سەردانی ئەمڕۆ، فرۆشتن، داواکاری، تێبینی',
        primaryInsight: '3 سەردان',
        secondaryInsight: '18 داواکاری',
      },
      {
        period: 'هەفتانە',
        visits: 4,
        salesCartons: 67,
        requests: 21,
        notes: 'باشترین مارکێت، چالاکترین موشریف، پوختەی هەفتەکە',
        primaryInsight: 'مارکێتی شار',
        secondaryInsight: 'بەهروز',
      },
      {
        period: 'مانگانە',
        visits: 3,
        salesCartons: 53,
        requests: 18,
        notes: 'گەشەی فرۆشتن، بەراوردی ناوچەکان، پوختەی مانگەکە',
        primaryInsight: '53 کارتۆن',
        secondaryInsight: 'هەولێر',
      },
    ]);
  });

  it('creates notification counts for missing reports and missed visits', () => {
    expect(
      buildShahryarNotifications({
        data: SHAHRYAR_REPORT_INPUT.sourceData,
        referenceDate: SHAHRYAR_REPORT_INPUT.referenceDate,
      }),
    ).toEqual([
      expect.objectContaining({
        kind: 'missing-report',
        label: 'ڕاپۆرت نەهات',
        count: 1,
        unit: 'موشریف',
      }),
      expect.objectContaining({
        kind: 'missed-visit',
        label: 'سەردان نەکرا',
        count: 1,
        unit: 'مارکێت',
      }),
    ]);
  });
});
