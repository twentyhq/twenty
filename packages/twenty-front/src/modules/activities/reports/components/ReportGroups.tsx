import React from 'react';

import { ReportGroup } from '@/activities/reports/components/ReportGroup';
import {
  REPORT_GROUP_TIME_SPANS,
  ReportGroupTimeSpan,
} from '@/activities/reports/constants/ReportGroupTimeSpans';
import { Report } from '@/activities/reports/types/Report';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { capitalize } from '~/utils/string/capitalize';

export const ReportGroups = () => {
  const { records: reports } = useFindManyRecords<Report>({
    objectNameSingular: CoreObjectNameSingular.Report,
  });

  const reportGroups: { title: string; reports: any[] }[] =
    REPORT_GROUP_TIME_SPANS.map((reportGroupTimeSpan, i) => {
      const largerReportGroupTimeSpan: ReportGroupTimeSpan | undefined =
        REPORT_GROUP_TIME_SPANS[i + 1];

      const groupReports = reports.filter((report) => {
        const createdAt = new Date(report.createdAt);
        const now = new Date();
        const sinceMs = +now - +createdAt;

        return (
          sinceMs >= reportGroupTimeSpan.minSinceMs &&
          sinceMs < largerReportGroupTimeSpan.minSinceMs
        );
      });

      return {
        title: reportGroupTimeSpan.title,
        reports: groupReports,
      };
    }).filter((reportGroup) => reportGroup.reports.length);

  return (
    <div>
      {reportGroups.map((reportGroup) => (
        <ReportGroup
          title={capitalize(reportGroup.title)}
          reports={reportGroup.reports}
        />
      ))}
    </div>
  );
};
