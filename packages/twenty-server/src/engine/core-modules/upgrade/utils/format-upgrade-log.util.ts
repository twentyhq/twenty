import { isDefined } from 'twenty-shared/utils';

type UpgradeLogScalar = string | number | boolean;

type UpgradeLogFields = Record<string, UpgradeLogScalar | null | undefined>;

type FormatUpgradeLogParams = {
  message: string;
  event: string;
  fields?: UpgradeLogFields;
};

const UPGRADE_LOG_PREFIX = '[upgrade]';

const escapeForLogfmt = (value: UpgradeLogScalar): string => {
  const stringified = String(value);

  if (!/[\s"=]/.test(stringified)) {
    return stringified;
  }

  return `"${stringified.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
};

/**
 * Emits a log line that reads naturally for humans yet is parseable by Loki's
 * `| logfmt` decoder. The shape is:
 *
 *   [upgrade] <message> | event=<event> key=value ...
 *
 * The free-text message keeps a `git log`-style narrative for engineers
 * scrolling pod logs; the structured tail lets the dashboard panel pull out
 * `event`, `workspaceId`, `command`, `error`, etc.
 */
export const formatUpgradeLog = ({
  message,
  event,
  fields = {},
}: FormatUpgradeLogParams): string => {
  const tailParts: string[] = [`event=${event}`];

  for (const [key, value] of Object.entries(fields)) {
    if (!isDefined(value)) continue;
    tailParts.push(`${key}=${escapeForLogfmt(value)}`);
  }

  return `${UPGRADE_LOG_PREFIX} ${message} | ${tailParts.join(' ')}`;
};
