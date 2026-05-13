type UpgradeLogValue = string | number | boolean | null | undefined;

type UpgradeLogFields = Record<string, UpgradeLogValue>;

const UPGRADE_LOG_PREFIX = '[upgrade]';

const formatValue = (value: UpgradeLogValue): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const stringified = String(value);

  if (/[\s"=]/.test(stringified)) {
    return `"${stringified.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }

  return stringified;
};

export const formatUpgradeLog = (
  event: string,
  fields: UpgradeLogFields = {},
): string => {
  const parts = [`event=${event}`];

  for (const [key, value] of Object.entries(fields)) {
    const formatted = formatValue(value);

    if (formatted !== undefined) {
      parts.push(`${key}=${formatted}`);
    }
  }

  return `${UPGRADE_LOG_PREFIX} ${parts.join(' ')}`;
};
