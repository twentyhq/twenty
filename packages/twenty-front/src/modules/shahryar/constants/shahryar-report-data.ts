import { SHAHRYAR_REPORT_INPUT } from '@/shahryar/constants/shahryar-report-source-data';
import { buildShahryarReportData } from '@/shahryar/utils/shahryarReportUtils';

export const SHAHRYAR_REPORT_DATA = buildShahryarReportData({
  data: SHAHRYAR_REPORT_INPUT.sourceData,
  referenceDate: SHAHRYAR_REPORT_INPUT.referenceDate,
});
