// There is a feature request for receiving variables in `cache.modify`:
// @see https://github.com/apollographql/apollo-feature-requests/issues/259
// @see https://github.com/apollographql/apollo-client/issues/7129

// For now we need to parse `storeFieldName` to retrieve the variables.
export const parseApolloStoreFieldName = <
  Variables extends Record<string, unknown>,
>(
  storeFieldName: string,
) => {
  const matches = storeFieldName.match(/([a-zA-Z][a-zA-Z0-9 ]*)(\((.*)\))?/);

  const fieldName = matches?.[1];

  if (!fieldName) {
    return {};
  }

  const stringifiedVariables = matches[3];

  try {
    const fieldVariables = stringifiedVariables
      ? (JSON.parse(stringifiedVariables) as Variables)
      : undefined;

    return { fieldName, fieldVariables };
  } catch {
    return { fieldName };
  }
};
