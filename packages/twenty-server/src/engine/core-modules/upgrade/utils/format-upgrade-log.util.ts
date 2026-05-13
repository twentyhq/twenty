import { isDefined } from 'twenty-shared/utils';

type UpgradeLogScalar = string | number | boolean;

type UpgradeLogFields = Record<string, UpgradeLogScalar | null | undefined>;

type FormatUpgradeLogParams = {
  humanMessage: string;
  event: string;
  logFields?: UpgradeLogFields;
};

const UPGRADE_LOG_PREFIX = '[upgrade]';

const NEEDS_QUOTING = /[\s"=]/;
const CONTROL_CHARACTERS = /[\n\r\t]/;

const collapseControlCharacters = (raw: string): string =>
  raw.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');

const escapeLogValue = (value: UpgradeLogScalar): string => {
  const raw = String(value);

  if (!NEEDS_QUOTING.test(raw) && !CONTROL_CHARACTERS.test(raw)) {
    return raw;
  }

  const escaped = collapseControlCharacters(
    raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"'),
  );

  return `"${escaped}"`;
};

export const formatUpgradeLog = ({
  humanMessage,
  event,
  logFields = {},
}: FormatUpgradeLogParams): string => {
  const tailParts: string[] = [`event=${escapeLogValue(event)}`];

  for (const [key, value] of Object.entries(logFields)) {
    tailParts.push(
      `${key}=${isDefined(value) ? escapeLogValue(value) : String(value)}`,
    );
  }

  return `${humanMessage}\n${UPGRADE_LOG_PREFIX} ${tailParts.join(' ')}`;
};
