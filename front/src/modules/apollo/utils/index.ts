import { ApolloLink, gql, Operation } from '@apollo/client';

import formatTitle from './format-title';

const getGroup = (collapsed: boolean) =>
  collapsed
    ? console.groupCollapsed.bind(console)
    : console.group.bind(console);

const parseQuery = (queryString: string) => {
  const queryObj = gql`
    ${queryString}
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { name } = queryObj.definitions[0] as any;
  return [name ? name.value : 'Generic', queryString.trim()];
};

export const loggerLink = (getSchemaName: (operation: Operation) => string) =>
  new ApolloLink((operation, forward) => {
    const schemaName = getSchemaName(operation);
    operation.setContext({ start: Date.now() });

    const { variables } = operation;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operationType = (operation.query.definitions[0] as any).operation;
    const headers = operation.getContext().headers;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [queryName, query] = parseQuery(operation.query.loc!.source.body);

    if (operationType === 'subscription') {
      const date = new Date().toLocaleTimeString();

      const titleArgs = formatTitle(operationType, schemaName, queryName, date);

      console.groupCollapsed(...titleArgs);

      if (variables && Object.keys(variables).length !== 0) {
        console.log('VARIABLES', variables);
      }

      console.log('QUERY', query);

      console.groupEnd();

      return forward(operation);
    }

    return forward(operation).map((result) => {
      const time = Date.now() - operation.getContext().start;
      const errors = result.errors ?? result.data?.[queryName]?.errors;
      const hasError = Boolean(errors);

      try {
        const titleArgs = formatTitle(
          operationType,
          schemaName,
          queryName,
          time,
        );

        getGroup(!hasError)(...titleArgs);

        if (errors) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errors.forEach((err: any) => {
            console.log(
              `%c${err.message}`,
              // eslint-disable-next-line twenty/no-hardcoded-colors
              'color: #F51818; font-weight: lighter',
            );
          });
        }

        console.log('HEADERS: ', headers);

        if (variables && Object.keys(variables).length !== 0) {
          console.log('VARIABLES', variables);
        }

        console.log('QUERY', query);

        if (result.data) {
          console.log('RESULT', result.data);
        }
        if (errors) {
          console.log('ERRORS', errors);
        }

        console.groupEnd();
      } catch {
        // this may happen if console group is not supported
        console.log(
          `${operationType} ${schemaName}::${queryName} (in ${time} ms)`,
        );
        if (errors) {
          console.error(errors);
        }
      }

      return result;
    });
  });
