import {
  Kind,
  parse,
  print,
  type DefinitionNode,
  type DocumentNode,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

const ROOT_TYPE_NAMES = ['Query', 'Mutation'];

const getDefinitionName = (definition: DefinitionNode): string | undefined =>
  'name' in definition ? definition.name?.value : undefined;

const getRootFieldNames = (
  definitions: readonly DefinitionNode[],
): Set<string> =>
  new Set(
    definitions
      .filter(
        (definition) =>
          definition.kind === Kind.OBJECT_TYPE_DEFINITION &&
          ROOT_TYPE_NAMES.includes(definition.name.value),
      )
      .flatMap((definition) =>
        definition.kind === Kind.OBJECT_TYPE_DEFINITION
          ? (definition.fields ?? []).map((field) => field.name.value)
          : [],
      ),
  );

export const mergeCoreWorkflowAppOperationsIntoSdl = ({
  baseSdl,
  operationsSdl,
}: {
  baseSdl: string;
  operationsSdl: string;
}): string => {
  const baseDocument = parse(baseSdl);
  const baseDefinitionNames = new Set(
    baseDocument.definitions.map(getDefinitionName).filter(isDefined),
  );
  const baseRootFieldNames = getRootFieldNames(baseDocument.definitions);
  const operationsDocument = parse(operationsSdl);

  const hasCollidingRootField = [
    ...getRootFieldNames(operationsDocument.definitions),
  ].some((fieldName) => baseRootFieldNames.has(fieldName));

  if (hasCollidingRootField) {
    return baseSdl;
  }

  const appendedDefinitions: DefinitionNode[] = [];

  for (const definition of operationsDocument.definitions) {
    const definitionName = getDefinitionName(definition);

    if (!isDefined(definitionName)) {
      continue;
    }

    const isAlreadyDeclared = baseDefinitionNames.has(definitionName);

    if (ROOT_TYPE_NAMES.includes(definitionName)) {
      appendedDefinitions.push(
        isAlreadyDeclared && definition.kind === Kind.OBJECT_TYPE_DEFINITION
          ? { ...definition, kind: Kind.OBJECT_TYPE_EXTENSION }
          : definition,
      );
      continue;
    }

    if (!isAlreadyDeclared) {
      appendedDefinitions.push(definition);
      continue;
    }

    if (definition.kind !== Kind.SCALAR_TYPE_DEFINITION) {
      return baseSdl;
    }
  }

  const mergedDocument: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [...baseDocument.definitions, ...appendedDefinitions],
  };

  return print(mergedDocument);
};
