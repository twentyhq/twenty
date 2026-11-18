import { type Plugin } from 'graphql-yoga';
import { NoSchemaIntrospectionCustomRule } from 'graphql/validation/rules/custom/NoSchemaIntrospectionCustomRule';

import { type GraphQLContext } from 'src/engine/api/graphql/graphql-config/graphql-config.service';
import { removeSuggestionInErrorsRule } from 'src/engine/core-modules/graphql/rules/remove-suggestion-in-errors.rule';
import { hasServerAdminAccess } from 'src/engine/guards/utils/has-server-admin-access.util';

export const useDisableIntrospectionAndSuggestionsWithoutServerAdminAccess = ({
  isProductionEnvironment,
  getServerAdminWorkspaceId,
}: {
  isProductionEnvironment: boolean;
  getServerAdminWorkspaceId: () => string | undefined;
}): Plugin<GraphQLContext> => ({
  onValidate: ({ context, addValidationRule }) => {
    if (!isProductionEnvironment) {
      return;
    }

    if (
      hasServerAdminAccess({
        authContext: context.req,
        serverAdminWorkspaceId: getServerAdminWorkspaceId(),
      })
    ) {
      return;
    }

    addValidationRule(NoSchemaIntrospectionCustomRule);
    addValidationRule(removeSuggestionInErrorsRule);
  },
});
