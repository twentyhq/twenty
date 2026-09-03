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

export type ActivityTargetColumn = {
  type: (typeof ACTIVITY_TARGET_COLUMN_CANDIDATES)[number]['type'];
  columnName: (typeof ACTIVITY_TARGET_COLUMN_CANDIDATES)[number]['columnNames'][number];
};

export const resolveActivityTargetColumns = (
  existingColumnNames: Set<string>,
): ActivityTargetColumn[] | undefined => {
  const targetColumns = ACTIVITY_TARGET_COLUMN_CANDIDATES.map(
    ({ type, columnNames }) => {
      const columnName = columnNames.find((candidateColumnName) =>
        existingColumnNames.has(candidateColumnName),
      );

      return columnName === undefined ? undefined : { type, columnName };
    },
  );

  return targetColumns.every(
    (targetColumn): targetColumn is ActivityTargetColumn =>
      targetColumn !== undefined,
  )
    ? targetColumns
    : undefined;
};
