import { engines } from '../../package.json';

import { checkNodeRequirement } from '@/app/project/check-node-requirement';
import { CLI_VERSION } from '@/constants/cli-version.constant';
import { type DoctorCheck } from '@/doctor/types/doctor-check.type';

export const getRuntimeDoctorChecks = (): DoctorCheck[] => {
  const isSupported =
    checkNodeRequirement({
      version: process.versions.node,
      range: engines.node,
    }) === 'satisfied';

  return [
    {
      id: 'node',
      status: isSupported ? 'pass' : 'fail',
      message: `Node ${process.versions.node}, required ${engines.node}.`,
      ...(isSupported
        ? {}
        : { hint: 'Switch to a supported Node version and rerun doctor.' }),
      details: { version: process.versions.node, required: engines.node },
    },
    {
      id: 'cli',
      status: 'pass',
      message: `twenty ${CLI_VERSION}, entry point ${process.argv[1] ?? 'unknown'}.`,
      details: {
        version: CLI_VERSION,
        nodeExecutable: process.execPath,
        entryPoint: process.argv[1] ?? null,
        platform: process.platform,
        arch: process.arch,
      },
    },
  ];
};
