import { checkNodeRequirement } from '@/app/project/check-node-requirement';
import { CLI_NODE_VERSION_RANGE } from '@/constants/cli-node-version-range.constant';
import { CLI_VERSION } from '@/constants/cli-version.constant';
import { type DoctorCheck } from '@/doctor/types/doctor-check.type';

export const getRuntimeDoctorChecks = (): DoctorCheck[] => {
  const isSupported =
    checkNodeRequirement({
      version: process.versions.node,
      range: CLI_NODE_VERSION_RANGE,
    }) === 'satisfied';

  return [
    {
      id: 'node',
      status: isSupported ? 'pass' : 'fail',
      message: `Node ${process.versions.node}, required ${CLI_NODE_VERSION_RANGE}.`,
      ...(isSupported
        ? {}
        : { hint: 'Switch to a supported Node version and rerun doctor.' }),
      details: {
        version: process.versions.node,
        required: CLI_NODE_VERSION_RANGE,
      },
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
