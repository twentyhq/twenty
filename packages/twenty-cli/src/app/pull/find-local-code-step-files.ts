import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  CODE_STEP_FILE_SUFFIX,
  getWorkflowCodeStepFolderPath,
} from '@/app/pull/extract-workflow-code-step-files';
import { type PullDeletion } from '@/app/pull/plan-pull-writes';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';

const toPosixPath = (value: string): string => value.split('\\').join('/');

// A step's own file is the one holding its evaluated source: a generated name may belong to an unrelated file
export const findLocalCodeStepFiles = async ({
  appPath,
  scannedFiles,
}: {
  appPath: string;
  scannedFiles: ScannedSourceFile[];
}): Promise<Map<string, PullDeletion[]>> => {
  const scannedRelativePaths = scannedFiles
    .filter((scannedFile) => scannedFile.isReadable)
    .map((scannedFile) => toPosixPath(scannedFile.relativePath));
  const contentByRelativePath = new Map<string, string>();
  const localCodeStepFilesByWorkflowPath = new Map<string, PullDeletion[]>();

  for (const scannedFile of scannedFiles) {
    const { config } = scannedFile;

    if (
      scannedFile.entityKey !== 'workflows' ||
      !isPlainObject(config) ||
      !isPlainObject(config.version) ||
      !Array.isArray(config.version.steps)
    ) {
      continue;
    }

    const workflowPath = toPosixPath(scannedFile.relativePath);
    const folderPath = `${getWorkflowCodeStepFolderPath(workflowPath)}/`;
    const candidatePaths = scannedRelativePaths.filter(
      (relativePath) =>
        relativePath.startsWith(folderPath) &&
        relativePath.endsWith(CODE_STEP_FILE_SUFFIX),
    );
    const codeStepFiles: PullDeletion[] = [];

    for (const candidatePath of candidatePaths) {
      if (!contentByRelativePath.has(candidatePath)) {
        contentByRelativePath.set(
          candidatePath,
          await readFile(join(appPath, candidatePath), 'utf8'),
        );
      }
    }

    for (const step of config.version.steps) {
      if (
        !isPlainObject(step) ||
        step.type !== 'CODE' ||
        !isString(step.universalIdentifier) ||
        !isPlainObject(step.input) ||
        !isString(step.input.code)
      ) {
        continue;
      }

      const code = step.input.code;
      const relativePath = candidatePaths.find(
        (candidatePath) =>
          contentByRelativePath.get(candidatePath) === code &&
          !codeStepFiles.some(
            (codeStepFile) => codeStepFile.relativePath === candidatePath,
          ),
      );

      if (isDefined(relativePath)) {
        codeStepFiles.push({
          universalIdentifier: step.universalIdentifier,
          relativePath,
        });
      }
    }

    localCodeStepFilesByWorkflowPath.set(workflowPath, codeStepFiles);
  }

  return localCodeStepFilesByWorkflowPath;
};
