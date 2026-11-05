import { readFile } from 'node:fs/promises';
import { join, posix } from 'node:path';

import { isDefined } from 'twenty-shared/utils';
import * as ts from 'typescript';

import { type PullEntity } from '@/app/pull/build-pull-entities';
import {
  CODE_STEP_FILE_SUFFIX,
  extractWorkflowCodeStepFiles,
  getWorkflowCodeStepFolderPath,
} from '@/app/pull/extract-workflow-code-step-files';
import { type PullDeletion } from '@/app/pull/plan-pull-writes';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';

const toPosixPath = (value: string): string => value.split('\\').join('/');

const isIdentifierNamed = ({
  node,
  name,
}: {
  node: ts.Node | undefined;
  name: string;
}) => isDefined(node) && ts.isIdentifier(node) && node.text === name;

const getPropertyInitializer = ({
  objectLiteral,
  propertyName,
}: {
  objectLiteral: ts.ObjectLiteralExpression;
  propertyName: string;
}): ts.Expression | undefined =>
  objectLiteral.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      !ts.isComputedPropertyName(property.name) &&
      property.name.text === propertyName,
  )?.initializer;

const getReadFileSegments = (
  expression: ts.Expression | undefined,
): string[] | undefined => {
  if (
    !isDefined(expression) ||
    !ts.isCallExpression(expression) ||
    !isIdentifierNamed({ node: expression.expression, name: 'readFileSync' })
  ) {
    return undefined;
  }

  const [pathExpression] = expression.arguments;

  if (
    !isDefined(pathExpression) ||
    !ts.isCallExpression(pathExpression) ||
    !isIdentifierNamed({ node: pathExpression.expression, name: 'join' })
  ) {
    return undefined;
  }

  const [directory, ...segments] = pathExpression.arguments;

  return isIdentifierNamed({ node: directory, name: '__dirname' }) &&
    segments.every(ts.isStringLiteralLike)
    ? segments.map((segment) => segment.text)
    : undefined;
};

const readCodeStepPathByStepIdentifier = ({
  workflowPath,
  source,
}: {
  workflowPath: string;
  source: string;
}): Map<string, string> => {
  const codeStepPathByStepIdentifier = new Map<string, string>();
  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const universalIdentifier = getPropertyInitializer({
        objectLiteral: node,
        propertyName: 'universalIdentifier',
      });
      const input = getPropertyInitializer({
        objectLiteral: node,
        propertyName: 'input',
      });
      const segments =
        isDefined(input) && ts.isObjectLiteralExpression(input)
          ? getReadFileSegments(
              getPropertyInitializer({
                objectLiteral: input,
                propertyName: 'code',
              }),
            )
          : undefined;

      if (
        isDefined(universalIdentifier) &&
        ts.isStringLiteralLike(universalIdentifier) &&
        isDefined(segments)
      ) {
        codeStepPathByStepIdentifier.set(
          universalIdentifier.text.toLowerCase(),
          posix.join(posix.dirname(workflowPath), ...segments),
        );
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(
    ts.createSourceFile(workflowPath, source, ts.ScriptTarget.Latest, false),
  );

  return codeStepPathByStepIdentifier;
};

// A step owns the file its workflow reads, or the unchanged file the base pulled for a step since removed locally
export const findLocalCodeStepFiles = async ({
  appPath,
  scannedFiles,
  baseEntities,
}: {
  appPath: string;
  scannedFiles: ScannedSourceFile[];
  baseEntities: PullEntity[];
}): Promise<Map<string, PullDeletion[]>> => {
  const readableRelativePaths = new Set(
    scannedFiles
      .filter((scannedFile) => scannedFile.isReadable)
      .map((scannedFile) => toPosixPath(scannedFile.relativePath)),
  );
  const baseWorkflowConfigByUniversalIdentifier = new Map(
    baseEntities
      .filter((entity) => entity.kind === 'workflow')
      .map((entity) => [
        entity.universalIdentifier.toLowerCase(),
        entity.config,
      ]),
  );
  const localCodeStepFilesByWorkflowPath = new Map<string, PullDeletion[]>();

  for (const scannedFile of scannedFiles) {
    if (scannedFile.entityKey !== 'workflows') {
      continue;
    }

    const workflowPath = toPosixPath(scannedFile.relativePath);
    const folderPath = `${getWorkflowCodeStepFolderPath(workflowPath)}/`;
    const codeStepPathByStepIdentifier = new Map<string, string>();
    const ownedRelativePaths = new Set<string>();
    const isUnownedCodeStepFile = (relativePath: string) =>
      relativePath.startsWith(folderPath) &&
      relativePath.endsWith(CODE_STEP_FILE_SUFFIX) &&
      readableRelativePaths.has(relativePath) &&
      !ownedRelativePaths.has(relativePath);
    const ownCodeStepFile = ({
      stepIdentifier,
      relativePath,
    }: {
      stepIdentifier: string;
      relativePath: string;
    }) => {
      codeStepPathByStepIdentifier.set(stepIdentifier, relativePath);
      ownedRelativePaths.add(relativePath);
    };

    for (const [
      stepUniversalIdentifier,
      relativePath,
    ] of readCodeStepPathByStepIdentifier({
      workflowPath,
      source: await readFile(join(appPath, workflowPath), 'utf8'),
    })) {
      if (isUnownedCodeStepFile(relativePath)) {
        ownCodeStepFile({
          stepIdentifier: stepUniversalIdentifier,
          relativePath,
        });
      }
    }

    const baseConfig = isDefined(scannedFile.universalIdentifier)
      ? baseWorkflowConfigByUniversalIdentifier.get(
          scannedFile.universalIdentifier.toLowerCase(),
        )
      : undefined;
    const baseCodeStepFiles = extractWorkflowCodeStepFiles({
      config: baseConfig,
      workflowRelativePath: workflowPath,
      localCodeStepPathByStepIdentifier: codeStepPathByStepIdentifier,
    }).codeStepFiles;

    for (const {
      universalIdentifier,
      relativePath,
      content,
    } of baseCodeStepFiles) {
      const stepIdentifier = universalIdentifier.toLowerCase();

      if (
        !codeStepPathByStepIdentifier.has(stepIdentifier) &&
        isUnownedCodeStepFile(relativePath) &&
        (await readFile(join(appPath, relativePath), 'utf8')) === content
      ) {
        ownCodeStepFile({ stepIdentifier, relativePath });
      }
    }

    localCodeStepFilesByWorkflowPath.set(
      workflowPath,
      [...codeStepPathByStepIdentifier].map(
        ([universalIdentifier, relativePath]) => ({
          universalIdentifier,
          relativePath,
        }),
      ),
    );
  }

  return localCodeStepFilesByWorkflowPath;
};
