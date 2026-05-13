import { isDefined } from 'twenty-shared/utils';

type UpgradeLogScalar = string | number | boolean;

type UpgradeLogFields = Record<string, UpgradeLogScalar | null | undefined>;

type FormatUpgradeLogParams = {
  message: string;
  event: string;
  fields?: UpgradeLogFields;
};

const UPGRADE_LOG_PREFIX = '[upgrade]';

const NEEDS_QUOTING = /[\s"=]/;
const CONTROL_CHARACTERS = /[\n\r\t]/;

const escapeLogValue = (value: UpgradeLogScalar): string => {
  const raw = String(value);

  if (!NEEDS_QUOTING.test(raw) && !CONTROL_CHARACTERS.test(raw)) {
    return raw;
  }

  const escaped = raw
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');

  return `"${escaped}"`;
};

export const formatUpgradeLog = ({
  message,
  event,
  fields = {},
}: FormatUpgradeLogParams): string => {
  const tailParts: string[] = [`event=${escapeLogValue(event)}`];

  for (const [key, value] of Object.entries(fields)) {
    tailParts.push(
      `${key}=${isDefined(value) ? escapeLogValue(value) : String(value)}`,
    );
  }

  return `${UPGRADE_LOG_PREFIX} ${message} | ${tailParts.join(' ')}`;
};
