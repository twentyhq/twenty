import { ReportGroup } from '@/activities/reports/types/ReportGroup';

export const REPORT_GROUPS: ReportGroup[] = [
  {
    name: 'today',
    minSinceMs: 0,
  },
  {
    name: 'over a day ago',
    minSinceMs: 1000 * 60 * 60 * 24,
  },
  {
    name: 'over a week ago',
    minSinceMs: 1000 * 60 * 60 * 24 * 7,
  },
  {
    name: 'over a month ago',
    minSinceMs: 1000 * 60 * 60 * 24 * 30,
  },
  {
    name: 'over a year ago',
    minSinceMs: 1000 * 60 * 60 * 24 * 365,
  },
  ...[
    'two',
    'three',
    'four',
    'five',
    'six',
    'sever',
    'eight',
    'nine',
    'ten',
  ].map((yearCount, i) => {
    return {
      name: `over ${yearCount} years ago`,
      minSinceMs: 1000 * 60 * 60 * 24 * 365 * (i + 2),
    };
  }),
];
