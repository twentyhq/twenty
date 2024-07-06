export interface ReportGroupTimeSpan {
  title: string;
  minSinceMs: number;
}

export const REPORT_GROUP_TIME_SPANS: ReportGroupTimeSpan[] = [
  {
    title: 'today',
    minSinceMs: 0,
  },
  {
    title: 'one day ago',
    minSinceMs: 1000 * 60 * 60 * 24,
  },
  {
    title: 'one week ago',
    minSinceMs: 1000 * 60 * 60 * 24 * 7,
  },
  {
    title: 'one month ago',
    minSinceMs: 1000 * 60 * 60 * 24 * 30,
  },
  {
    title: 'one year ago',
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
      title: `${yearCount} years ago`,
      minSinceMs: 1000 * 60 * 60 * 24 * 365 * (i + 2),
    };
  }),
];
