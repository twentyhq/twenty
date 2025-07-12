import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { ApolloLink, Observable, ServerError } from '@apollo/client';
import { FieldNode, OperationDefinitionNode } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

export const restFileUploadLink = new ApolloLink((operation, forward) => {
  const operationDef = operation.query.definitions.find(
    (def): def is OperationDefinitionNode => def.kind === 'OperationDefinition',
  );

  if (!operationDef || operationDef.operation !== 'mutation') {
    return forward(operation);
  }

  const hasRestDirective = operationDef.selectionSet.selections.some(
    (selection) => {
      if (selection.kind !== 'Field') return false;

      return selection.directives?.some(
        (directive) =>
          directive.name.value === 'rest' &&
          directive.arguments?.some(
            (arg) =>
              arg.name.value === 'method' &&
              arg.value.kind === 'StringValue' &&
              arg.value.value === 'POST',
          ),
      );
    },
  );

  if (!hasRestDirective) {
    return forward(operation);
  }

  const hasFileVariables =
    operation.variables &&
    Object.values(operation.variables).some((value) => value instanceof File);

  if (!hasFileVariables) {
    return forward(operation);
  }

  return new Observable((observer) => {
    const restField = operationDef.selectionSet.selections.find(
      (selection): selection is FieldNode => {
        if (selection.kind !== 'Field') {
          return false;
        }

        return (
          selection.directives?.some(
            (directive) => directive.name.value === 'rest',
          ) ?? false
        );
      },
    );

    if (!restField) {
      observer.error(new Error('REST field not found'));
      return;
    }

    const restDirective = restField.directives?.find(
      (dir) => dir.name.value === 'rest',
    );
    if (!restDirective) {
      observer.error(new Error('REST directive not found'));
      return;
    }

    const pathArg = restDirective.arguments?.find(
      (arg) => arg.name.value === 'path',
    );
    const path =
      pathArg?.value.kind === 'StringValue' ? pathArg.value.value : '';

    const formData = new FormData();

    Object.entries(operation.variables).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (isDefined(value)) {
        formData.append(key, String(value));
      }
    });

    fetch(`${REST_API_BASE_URL}${path}`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${getTokenPair()?.accessToken.token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          const networkError = new Error(
            `Upload failed: ${response.statusText}`,
          ) as ServerError;

          networkError.statusCode = response.status;

          throw networkError;
        }
        const result = await response.json();

        const data = {
          [restField.name.value]: result,
        };

        observer.next({ data });
        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      });
  });
});
