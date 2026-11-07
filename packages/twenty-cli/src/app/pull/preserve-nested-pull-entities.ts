import { isDefined } from 'twenty-shared/utils';

import { collectIdentifiers } from '@/app/pull/collect-identifiers';
import { getWorkflowCodeStepFolderPath } from '@/app/pull/extract-workflow-code-step-files';
import {
  type PullEntity,
  type SkippedPullEntity,
} from '@/app/pull/build-pull-entities';
import { type PullWrite, type PullDeletion } from '@/app/pull/plan-pull-writes';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';

export const preserveNestedPullEntities = ({
  entities,
  baseEntities,
  protectedIdentifiers,
  writes,
  deletions,
  scannedFiles,
}: {
  entities: PullEntity[];
  baseEntities: PullEntity[];
  protectedIdentifiers: ReadonlySet<string>;
  writes: PullWrite[];
  deletions: PullDeletion[];
  scannedFiles: ScannedSourceFile[];
}): {
  writes: PullWrite[];
  deletions: PullDeletion[];
  skipped: SkippedPullEntity[];
} => {
  const baseIdentifiers = new Set<string>();

  collectIdentifiers({ value: baseEntities, identifiers: baseIdentifiers });

  const localIdentifiersByPath = new Map(
    scannedFiles.map((file) => {
      const identifiers = new Set<string>();

      collectIdentifiers({ value: file.config, identifiers });

      return [file.relativePath.split('\\').join('/'), identifiers];
    }),
  );
  const exportedConfigByIdentifier = new Map(
    entities.map((entity) => [
      entity.universalIdentifier.toLowerCase(),
      entity.config,
    ]),
  );
  const baseEntityByIdentifier = new Map(
    baseEntities.map((entity) => [
      entity.universalIdentifier.toLowerCase(),
      entity,
    ]),
  );
  const changes = [
    ...writes.filter(
      (write) => write.kind !== 'translation' && write.isRegeneration,
    ),
    ...deletions.flatMap((deletion) => {
      const entity = baseEntityByIdentifier.get(
        deletion.universalIdentifier.toLowerCase(),
      );

      return isDefined(entity) ? [{ ...deletion, kind: entity.kind }] : [];
    }),
  ];
  const skipped: SkippedPullEntity[] = [];
  const skippedPaths = new Set<string>();
  const skippedWorkflows: {
    codeStepFolderPath: string;
    identifiers: Set<string>;
  }[] = [];

  let previousSkippedCount: number;

  do {
    previousSkippedCount = skippedPaths.size;
    const retainedIdentifiersByPath = new Map(localIdentifiersByPath);

    for (const write of writes) {
      if (
        write.kind === 'translation' ||
        skippedPaths.has(write.relativePath)
      ) {
        continue;
      }

      const identifiers = new Set<string>();

      collectIdentifiers({
        value: exportedConfigByIdentifier.get(
          write.universalIdentifier.toLowerCase(),
        ),
        identifiers,
      });
      retainedIdentifiersByPath.set(write.relativePath, identifiers);
    }

    for (const deletion of deletions) {
      if (!skippedPaths.has(deletion.relativePath)) {
        retainedIdentifiersByPath.delete(deletion.relativePath);
      }
    }

    const retainedIdentifiers = new Set(
      [...retainedIdentifiersByPath.values()].flatMap((identifiers) => [
        ...identifiers,
      ]),
    );

    for (const change of changes) {
      if (
        skippedPaths.has(change.relativePath) ||
        change.kind === 'translation' ||
        change.kind === 'dependency'
      ) {
        continue;
      }

      const omittedIdentifier = [
        ...(localIdentifiersByPath.get(change.relativePath) ?? []),
      ].find(
        (identifier) =>
          !retainedIdentifiers.has(identifier) &&
          (protectedIdentifiers.has(identifier) ||
            !baseIdentifiers.has(identifier)),
      );

      if (isDefined(omittedIdentifier)) {
        skippedPaths.add(change.relativePath);

        if (change.kind === 'workflow') {
          const identifiers = new Set(
            localIdentifiersByPath.get(change.relativePath),
          );

          collectIdentifiers({
            value: exportedConfigByIdentifier.get(
              change.universalIdentifier.toLowerCase(),
            ),
            identifiers,
          });
          skippedWorkflows.push({
            codeStepFolderPath: `${getWorkflowCodeStepFolderPath(change.relativePath)}/`,
            identifiers,
          });
        }

        skipped.push({
          kind: change.kind,
          universalIdentifier: change.universalIdentifier,
          reason: `preserving ${change.relativePath}, replacement would remove nested local definition ${omittedIdentifier} without a confirmed remote deletion`,
        });
      }
    }
  } while (skippedPaths.size !== previousSkippedCount);

  // A preserved workflow still reads its own code step files; its folder may hold another workflow's
  const isPreserved = ({
    relativePath,
    universalIdentifier,
  }: Pick<PullDeletion, 'relativePath' | 'universalIdentifier'>) =>
    skippedPaths.has(relativePath) ||
    skippedWorkflows.some(
      ({ codeStepFolderPath, identifiers }) =>
        relativePath.startsWith(codeStepFolderPath) &&
        identifiers.has(universalIdentifier.toLowerCase()),
    );

  return {
    writes: writes.filter((write) => !isPreserved(write)),
    deletions: deletions.filter((deletion) => !isPreserved(deletion)),
    skipped,
  };
};
