export type LinkglogsGroupedData = Record<
  string,
  Record<string, string | number>
>;

export type LinklogsData = Record<string, string | number>[];

export type LinklogsChartData = {
  data: LinklogsData;
  sourceKeyColors: Record<string, string>;
};
