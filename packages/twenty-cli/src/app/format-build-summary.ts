import { formatBytes } from 'twenty-shared/utils';

import { formatAppDuration } from '@/app/format-app-duration';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CLI_VERSION } from '@/constants/cli-version.constant';
import { dimText, formatSuccessLine } from '@/output/style';

const ROLE_LABELS: Record<string, [singular: string, plural: string]> = {
  'built-logic-function': ['logic function', 'logic functions'],
  'built-front-component': ['front component', 'front components'],
  source: ['source file', 'source files'],
  dependencies: ['dependency file', 'dependency files'],
  'public-asset': ['asset', 'assets'],
};

const ROLE_ORDER = Object.keys(ROLE_LABELS);

const getRoleRank = (role: string) => {
  const rank = ROLE_ORDER.indexOf(role);

  return rank === -1 ? ROLE_ORDER.length : rank;
};

const formatRoleCounts = (build: ToolingBuild) => {
  const roleCounts = new Map<string, number>();

  for (const file of build.files) {
    roleCounts.set(file.role, (roleCounts.get(file.role) ?? 0) + 1);
  }

  return [...roleCounts]
    .sort(
      ([firstRole], [secondRole]) =>
        getRoleRank(firstRole) - getRoleRank(secondRole),
    )
    .map(([role, count]) => {
      const labels = ROLE_LABELS[role] ?? [role, role];

      return `${count} ${labels[count === 1 ? 0 : 1]}`;
    })
    .join(' · ');
};

export const formatBuildSummary = ({
  build,
  durationMilliseconds,
}: {
  build: ToolingBuild;
  durationMilliseconds: number;
}) => {
  const totalSize = build.files.reduce((sum, file) => sum + file.size, 0);

  return [
    formatSuccessLine(
      `Built ${build.application.displayName} with twenty ${CLI_VERSION} ${dimText(`in ${formatAppDuration(durationMilliseconds)}`)}`,
    ),
    dimText(
      `  ${build.files.length} files · ${formatBytes(totalSize)} · content hash ${build.contentHash.slice(0, 12)}`,
    ),
    dimText(`  ${formatRoleCounts(build)}`),
    dimText('  Nothing was uploaded.'),
  ].join('\n');
};
