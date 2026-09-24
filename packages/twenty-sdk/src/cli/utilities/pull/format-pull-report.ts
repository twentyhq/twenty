import { type ApplicationExportCoverageEntry } from '@/cli/utilities/pull/application-export-type';
import { type SkippedPullEntity } from '@/cli/utilities/pull/build-pull-entities';
import {
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';
import { isDefined } from 'twenty-shared/utils';

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

type CoverageGroup = {
  metadataName: string;
  reason: string | null;
  identifiers: string[];
};

const groupCoverageByMetadataNameAndReason = (
  coverage: ApplicationExportCoverageEntry[],
): CoverageGroup[] => {
  const groupByKey = new Map<string, CoverageGroup>();

  for (const entry of coverage) {
    const key = JSON.stringify([entry.metadataName, entry.reason]);
    const group = groupByKey.get(key) ?? {
      metadataName: entry.metadataName,
      reason: entry.reason,
      identifiers: [],
    };

    group.identifiers.push(entry.universalIdentifier);
    groupByKey.set(key, group);
  }

  return [...groupByKey.values()].sort(
    (left, right) =>
      left.metadataName.localeCompare(right.metadataName) ||
      (left.reason ?? '').localeCompare(right.reason ?? ''),
  );
};

export const formatPullReport = ({
  writes,
  deletions,
  unchangedCount,
  skipped,
  coverage,
  localOnlyRelativePaths,
  unreadableRelativePaths = [],
  compiledTranslationEntryCountByLocale = {},
  entityLabelByUniversalIdentifier = {},
  verbose = false,
}: {
  writes: PullWrite[];
  deletions: PullDeletion[];
  unchangedCount: number;
  skipped: SkippedPullEntity[];
  coverage: ApplicationExportCoverageEntry[];
  localOnlyRelativePaths: string[];
  unreadableRelativePaths?: string[];
  compiledTranslationEntryCountByLocale?: Record<string, number>;
  entityLabelByUniversalIdentifier?: Record<string, string>;
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

  if (unreadableRelativePaths.length > 0) {
    lines.push(
      '',
      'Could not be read, so a second file may now define the same entity (run `yarn install` and pull again):',
      ...unreadableRelativePaths
        .slice()
        .sort()
        .map((relativePath) => `  ${relativePath}`),
    );
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

  const writtenWithoutLocalState = coverage
    .filter((entry) => entry.status === 'EXPORTED' && isDefined(entry.reason))
    .map(
      (entry) =>
        `  ${entry.metadataName} ${
          entityLabelByUniversalIdentifier[entry.universalIdentifier] ??
          entry.universalIdentifier
        }: ${entry.reason}`,
    )
    .sort();

  if (writtenWithoutLocalState.length > 0) {
    const listedWrittenWithoutLocalState = verbose
      ? writtenWithoutLocalState
      : writtenWithoutLocalState.slice(0, MAX_LISTED_IDENTIFIERS);

    lines.push(
      '',
      `Written without their workspace-local state (${writtenWithoutLocalState.length} row(s)):`,
      ...listedWrittenWithoutLocalState,
    );

    if (
      writtenWithoutLocalState.length > listedWrittenWithoutLocalState.length
    ) {
      lines.push(
        `  …and ${writtenWithoutLocalState.length - listedWrittenWithoutLocalState.length} more, listed with --verbose`,
      );
    }
  }

  for (const section of COVERAGE_SECTIONS) {
    const sectionEntries = coverage.filter(
      (entry) => entry.status === section.status,
    );

    if (sectionEntries.length === 0) {
      continue;
    }

    lines.push('', `${section.title} (${sectionEntries.length} row(s)):`);

    for (const {
      metadataName,
      reason,
      identifiers,
    } of groupCoverageByMetadataNameAndReason(sectionEntries)) {
      lines.push(
        `  ${metadataName.padEnd(34)}${String(identifiers.length).padEnd(6)}${reason ?? ''}`.trimEnd(),
      );

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

  const compiledLocales = Object.entries(compiledTranslationEntryCountByLocale)
    .filter(([, count]) => count > 0)
    .sort(([left], [right]) => left.localeCompare(right));

  if (compiledLocales.length > 0) {
    lines.push(
      '',
      'Translations kept in compiled form until their source strings are in this tree (see locales/compiled/):',
      ...compiledLocales.map(
        ([locale, count]) =>
          `  ${locale.padEnd(13)}${count} ${count === 1 ? 'entry' : 'entries'}`,
      ),
    );
  }

  return lines.join('\n');
};
