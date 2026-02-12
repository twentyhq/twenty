import { type QueryFailedError } from 'typeorm';

export type PostgreSQLError = QueryFailedError & {
  detail?: string;
  driverError?: Error & {
    detail?: string;
  };
};

export type ParsedConstraintError = {
  columnName: string;
  conflictingValue: string;
};

export const parsePostgresConstraintError = (
  error: PostgreSQLError,
): ParsedConstraintError | null => {
  const errorDetail = error.detail;

  if (!errorDetail) {
    return null;
  }

  const detailMatch = errorDetail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);

  if (!detailMatch) {
    return null;
  }

  const columnName = detailMatch[1].replace(/^["']|["']$/g, '');
  const conflictingValue = detailMatch[2];

  return {
    columnName,
    conflictingValue,
  };
};
