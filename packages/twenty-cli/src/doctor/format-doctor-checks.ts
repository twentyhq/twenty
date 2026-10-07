import { isDefined } from 'twenty-shared/utils';

import { type DoctorCheck } from '@/doctor/types/doctor-check.type';
import { colorText } from '@/output/style';

const COLOR_BY_STATUS = {
  pass: 'green',
  warning: 'yellow',
  fail: 'red',
  skipped: 'yellow',
} as const;

export const formatDoctorChecks = (
  checks: DoctorCheck[],
  stream: NodeJS.WriteStream = process.stdout,
) =>
  checks
    .map((check) => {
      const hint = isDefined(check.hint) ? `\n  ${check.hint}` : '';

      const status = colorText(
        COLOR_BY_STATUS[check.status],
        `[${check.status.toUpperCase()}]`,
        stream,
      );

      return `${status} ${check.id}: ${check.message}${hint}`;
    })
    .join('\n');
