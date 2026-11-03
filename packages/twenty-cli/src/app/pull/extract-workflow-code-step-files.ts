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

const CODE_STEP_FILE_SUFFIX = '.code.ts';

// The CLI evaluates definitions as CommonJS, where __dirname is the workflow file's folder
const CODE_STEP_SOURCE_IMPORT_STATEMENTS = [
  "import { readFileSync } from 'node:fs';",
  "import { join } from 'node:path';",
];

const getCodeStepFolderName = (workflowRelativePath: string): string =>
  posix.basename(workflowRelativePath).replace(/(\.workflow)?\.tsx?$/, '');

const reserveCodeStepFileName = ({
  fileBaseName,
  universalIdentifier,
  takenFileNames,
}: {
  fileBaseName: string;
  universalIdentifier: string;
  takenFileNames: Set<string>;
}): string => {
  const fileName = `${fileBaseName}${CODE_STEP_FILE_SUFFIX}`;
  const reservedFileName = takenFileNames.has(fileName)
    ? `${universalIdentifier.slice(0, 8)}-${fileName}`
    : fileName;

  takenFileNames.add(reservedFileName);

  return reservedFileName;
};

export const extractWorkflowCodeStepFiles = ({
  config,
  workflowRelativePath,
}: {
  config: unknown;
  workflowRelativePath: string;
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
      fileBaseName: toFileBaseName({
        segments: [isString(step.name) ? step.name : null],
        universalIdentifier: step.universalIdentifier,
      }),
      universalIdentifier: step.universalIdentifier,
      takenFileNames,
    });

    codeStepFiles.push({
      universalIdentifier: step.universalIdentifier,
      relativePath: posix.join(
        posix.dirname(workflowRelativePath),
        folderName,
        fileName,
      ),
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

  return codeStepFiles.length === 0
    ? { config, importStatements: [], codeStepFiles }
    : {
        config: { ...config, version: { ...config.version, steps } },
        importStatements: CODE_STEP_SOURCE_IMPORT_STATEMENTS,
        codeStepFiles,
      };
};
