// There is a feature request for receiving variables in `cache.modify`:
// @see https://github.com/apollographql/apollo-feature-requests/issues/259
// @see https://github.com/apollographql/apollo-client/issues/7129

// For now we need to parse `storeFieldName` to retrieve the variables.
export const parseApolloStoreFieldName = <
  Variables extends Record<string, unknown>,
>(
  storeFieldName: string,
) => {
  const matches = storeFieldName.match(/([a-zA-Z][a-zA-Z0-9 ]*)\((.*)\)/);

  if (!matches?.[1]) return {};

  const [, , stringifiedVariables] = matches;
  const fieldName = matches[1] as string;

  try {
    const variables = stringifiedVariables
      ? (JSON.parse(stringifiedVariables) as Variables)
      : undefined;

    return { fieldName, variables };
  } catch {
    return { fieldName };
  }
};
