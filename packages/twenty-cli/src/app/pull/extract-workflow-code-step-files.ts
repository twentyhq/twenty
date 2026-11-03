import { posix } from 'node:path';

import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import {
  printString,
  typescriptExpression,
} from '@/app/pull/print-typescript-value';
import { toFileBaseName } from '@/app/pull/pull-file-base-name';

export type WorkflowCodeStepFile = {
  universalIdentifier: string;
  relativePath: string;
  content: string;
};

export const CODE_STEP_FILE_SUFFIX = '.code.ts';

// The CLI evaluates definitions as CommonJS, where __dirname is the workflow file's folder
const CODE_STEP_SOURCE_IMPORT_STATEMENTS = [
  "import { readFileSync } from 'node:fs';",
  "import { join } from 'node:path';",
];

const getCodeStepFolderName = (workflowRelativePath: string): string =>
  posix.basename(workflowRelativePath).replace(/(\.workflow)?\.tsx?$/, '');

export const getWorkflowCodeStepFolderPath = (
  workflowRelativePath: string,
): string =>
  posix.join(
    posix.dirname(workflowRelativePath),
    getCodeStepFolderName(workflowRelativePath),
  );

export type IsCodeStepPathAvailable = (params: {
  relativePath: string;
  stepUniversalIdentifier: string;
}) => boolean;

const reserveCodeStepFileName = ({
  folderPath,
  fileBaseName,
  universalIdentifier,
  takenFileNames,
  isCodeStepPathAvailable,
}: {
  folderPath: string;
  fileBaseName: string;
  universalIdentifier: string;
  takenFileNames: Set<string>;
  isCodeStepPathAvailable: IsCodeStepPathAvailable;
}): string => {
  const identifierPrefix = universalIdentifier.slice(0, 8);
  const isAvailable = (fileName: string) =>
    !takenFileNames.has(fileName) &&
    isCodeStepPathAvailable({
      relativePath: posix.join(folderPath, fileName),
      stepUniversalIdentifier: universalIdentifier,
    });

  let fileName = `${fileBaseName}${CODE_STEP_FILE_SUFFIX}`;

  if (!isAvailable(fileName)) {
    fileName = `${identifierPrefix}-${fileName}`;
  }

  for (let suffix = 2; !isAvailable(fileName); suffix++) {
    fileName = `${identifierPrefix}-${fileBaseName}-${suffix}${CODE_STEP_FILE_SUFFIX}`;
  }

  takenFileNames.add(fileName);

  return fileName;
};

export const extractWorkflowCodeStepFiles = ({
  config,
  workflowRelativePath,
  isCodeStepPathAvailable = () => true,
}: {
  config: unknown;
  workflowRelativePath: string;
  isCodeStepPathAvailable?: IsCodeStepPathAvailable;
}): {
  config: unknown;
  importStatements: string[];
  codeStepFiles: WorkflowCodeStepFile[];
} => {
  if (
    !isPlainObject(config) ||
    !isPlainObject(config.version) ||
    !Array.isArray(config.version.steps)
  ) {
    return { config, importStatements: [], codeStepFiles: [] };
  }

  const folderName = getCodeStepFolderName(workflowRelativePath);
  const folderPath = getWorkflowCodeStepFolderPath(workflowRelativePath);
  const takenFileNames = new Set<string>();
  const codeStepFiles: WorkflowCodeStepFile[] = [];

  const steps = config.version.steps.map((step: unknown) => {
    if (
      !isPlainObject(step) ||
      step.type !== 'CODE' ||
      !isString(step.universalIdentifier) ||
      !isPlainObject(step.input) ||
      !isString(step.input.code)
    ) {
      return step;
    }

    const fileName = reserveCodeStepFileName({
      folderPath,
      fileBaseName: toFileBaseName({
        segments: [isString(step.name) ? step.name : null],
        universalIdentifier: step.universalIdentifier,
      }),
      universalIdentifier: step.universalIdentifier,
      takenFileNames,
      isCodeStepPathAvailable,
    });

    codeStepFiles.push({
      universalIdentifier: step.universalIdentifier,
      relativePath: posix.join(folderPath, fileName),
      content: step.input.code,
    });

    return {
      ...step,
      input: {
        ...step.input,
        code: typescriptExpression(
          `readFileSync(join(__dirname, ${printString(folderName)}, ${printString(fileName)}), 'utf8')`,
        ),
      },
    };
  });

  if (codeStepFiles.length === 0) {
    return { config, importStatements: [], codeStepFiles };
  }

  return {
    config: { ...config, version: { ...config.version, steps } },
    importStatements: CODE_STEP_SOURCE_IMPORT_STATEMENTS,
    codeStepFiles,
  };
};
