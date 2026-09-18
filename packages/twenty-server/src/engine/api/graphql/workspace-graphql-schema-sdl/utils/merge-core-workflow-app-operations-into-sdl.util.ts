import {
  Kind,
  parse,
  print,
  type DefinitionNode,
  type DocumentNode,
} from 'graphql';

const ROOT_TYPE_NAMES = ['Query', 'Mutation'];

const getDefinitionName = (definition: DefinitionNode): string | undefined =>
  'name' in definition ? definition.name?.value : undefined;

export const mergeCoreWorkflowAppOperationsIntoSdl = ({
  baseSdl,
  operationsSdl,
}: {
  baseSdl: string;
  operationsSdl: string;
}): string => {
  const baseDocument = parse(baseSdl);
  const baseDefinitionNames = new Set(
    baseDocument.definitions
      .map(getDefinitionName)
      .filter((name): name is string => name !== undefined),
  );

  const appendedDefinitions: DefinitionNode[] = [];

  for (const definition of parse(operationsSdl).definitions) {
    const definitionName = getDefinitionName(definition);

    if (definitionName === undefined) {
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
