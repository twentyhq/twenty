import { isDefined } from 'twenty-shared/utils';

import { type DoctorCheck } from '@/doctor/types/doctor-check.type';

export const formatDoctorChecks = (checks: DoctorCheck[]) =>
  checks
    .map((check) => {
      const hint = isDefined(check.hint) ? `\n  ${check.hint}` : '';

      return `[${check.status.toUpperCase()}] ${check.id}: ${check.message}${hint}`;
    })
    .join('\n');
