import { isDefined } from 'twenty-shared/utils';

import { escapeLiteral } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const formatSqlValue = (
  value: unknown,
  isJsonColumn = false,
): string => {
  if (!isDefined(value)) return 'NULL';

  if (isJsonColumn) {
    return escapeLiteral(JSON.stringify(value));
  }

  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 'NULL';

    return String(value);
  }

  if (typeof value === 'bigint') return String(value);

  if (value instanceof Date) return escapeLiteral(value.toISOString());

  if (Array.isArray(value)) {
    if (value.length === 0) return "'{}'";

    if (typeof value[0] === 'object') {
      return escapeLiteral(JSON.stringify(value));
    }

    const elements = value.map((element) =>
      typeof element === 'string'
        ? `"${element.replace(/"/g, '\\"')}"`
        : String(element),
    );

    return `'{${elements.join(',')}}'`;
  }

  if (typeof value === 'object') {
    return escapeLiteral(JSON.stringify(value));
  }

  return escapeLiteral(String(value));
};
