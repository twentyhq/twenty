import { isDefined } from 'twenty-shared/utils';

export const ACTIVITY_TARGET_COLUMN_CANDIDATES = [
  {
    type: 'person',
    columnNames: ['targetPersonId', 'personId'],
  },
  {
    type: 'company',
    columnNames: ['targetCompanyId', 'companyId'],
  },
  {
    type: 'opportunity',
    columnNames: ['targetOpportunityId', 'opportunityId'],
  },
] as const;

type ActivityTargetColumnCandidate =
  (typeof ACTIVITY_TARGET_COLUMN_CANDIDATES)[number];

export type ActivityTargetColumn = {
  [TCandidate in ActivityTargetColumnCandidate as TCandidate['type']]: {
    type: TCandidate['type'];
    columnName: TCandidate['columnNames'][number];
  };
}[ActivityTargetColumnCandidate['type']];

export const resolveActivityTargetColumns = (
  existingColumnNames: Set<string>,
): ActivityTargetColumn[] | undefined => {
  const targetColumns = ACTIVITY_TARGET_COLUMN_CANDIDATES.map(
    ({ type, columnNames }) => {
      const columnName = columnNames.find((candidateColumnName) =>
        existingColumnNames.has(candidateColumnName),
      );

      return isDefined(columnName) ? { type, columnName } : undefined;
    },
  );

  return targetColumns.every(
    (targetColumn): targetColumn is ActivityTargetColumn =>
      isDefined(targetColumn),
  )
    ? targetColumns
    : undefined;
};
