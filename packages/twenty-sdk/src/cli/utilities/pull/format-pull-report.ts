import { type ApplicationExportCoverageEntry } from '@/cli/utilities/pull/application-export-type';
import { type SkippedPullEntity } from '@/cli/utilities/pull/build-pull-entities';
import {
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';

const MAX_LISTED_IDENTIFIERS = 20;

const COVERAGE_SECTIONS = [
  {
    status: 'UNSUPPORTED' as const,
    title: 'Not written, unsupported by this version',
  },
  {
    status: 'FOREIGN_OWNED' as const,
    title: 'Owned by another application, not written',
  },
  {
    status: 'EXCLUDED' as const,
    title: 'Excluded as workspace runtime state',
  },
  {
    status: 'ENGINE_DERIVED' as const,
    title: 'Derived by the engine, rebuilt on apply',
  },
] as const;

const formatFileGroup = ({
  title,
  relativePaths,
}: {
  title: string;
  relativePaths: string[];
}): string[] =>
  relativePaths.length === 0
    ? []
    : relativePaths
        .slice()
        .sort()
        .map((relativePath) => `  ${title.padEnd(13)}${relativePath}`);

const countByMetadataName = (
  coverage: ApplicationExportCoverageEntry[],
): Map<string, string[]> => {
  const identifiersByMetadataName = new Map<string, string[]>();

  for (const entry of coverage) {
    const identifiers = identifiersByMetadataName.get(entry.metadataName) ?? [];

    identifiersByMetadataName.set(entry.metadataName, [
      ...identifiers,
      entry.universalIdentifier,
    ]);
  }

  return identifiersByMetadataName;
};

export const formatPullReport = ({
  writes,
  deletions,
  unchangedCount,
  skipped,
  coverage,
  localOnlyRelativePaths,
  verbose = false,
}: {
  writes: PullWrite[];
  deletions: PullDeletion[];
  unchangedCount: number;
  skipped: SkippedPullEntity[];
  coverage: ApplicationExportCoverageEntry[];
  localOnlyRelativePaths: string[];
  verbose?: boolean;
}): string => {
  const lines: string[] = [
    ...formatFileGroup({
      title: 'written',
      relativePaths: writes
        .filter((write) => !write.isRegeneration)
        .map((write) => write.relativePath),
    }),
    ...formatFileGroup({
      title: 'regenerated',
      relativePaths: writes
        .filter((write) => write.isRegeneration)
        .map((write) => write.relativePath),
    }),
    ...formatFileGroup({
      title: 'deleted',
      relativePaths: deletions.map((deletion) => deletion.relativePath),
    }),
  ];

  if (unchangedCount > 0) {
    lines.push(`  unchanged    ${unchangedCount} file(s)`);
  }

  if (skipped.length > 0) {
    lines.push('', 'Not written by the writer:');

    for (const skippedEntity of skipped) {
      lines.push(`  ${skippedEntity.kind} ${skippedEntity.reason}`);
    }
  }

  if (localOnlyRelativePaths.length > 0) {
    lines.push(
      '',
      'Local entities the workspace does not have (left untouched):',
      ...localOnlyRelativePaths
        .slice()
        .sort()
        .map((relativePath) => `  ${relativePath}`),
    );
  }

  for (const section of COVERAGE_SECTIONS) {
    const sectionEntries = coverage.filter(
      (entry) => entry.status === section.status,
    );

    if (sectionEntries.length === 0) {
      continue;
    }

    lines.push('', `${section.title} (${sectionEntries.length} row(s)):`);

    const identifiersByMetadataName = countByMetadataName(sectionEntries);

    for (const [metadataName, identifiers] of [
      ...identifiersByMetadataName.entries(),
    ].sort(([left], [right]) => left.localeCompare(right))) {
      lines.push(`  ${metadataName.padEnd(34)}${identifiers.length}`);

      if (verbose) {
        for (const identifier of identifiers.slice(0, MAX_LISTED_IDENTIFIERS)) {
          lines.push(`    ${identifier}`);
        }

        if (identifiers.length > MAX_LISTED_IDENTIFIERS) {
          lines.push(
            `    …and ${identifiers.length - MAX_LISTED_IDENTIFIERS} more`,
          );
        }
      }
    }
  }

  return lines.join('\n');
};
