import { type Plugin } from 'graphql-yoga';
import { NoSchemaIntrospectionCustomRule } from 'graphql/validation/rules/custom/NoSchemaIntrospectionCustomRule';
import { isDefined } from 'twenty-shared/utils';

import { type GraphQLContext } from 'src/engine/api/graphql/graphql-config/graphql-config.service';

export const useDisableIntrospectionForUnauthenticatedUsers = (
  isProductionEnvironment: boolean,
): Plugin<GraphQLContext> => ({
  onValidate: ({ context, addValidationRule }) => {
    const isAuthenticated = isDefined(context.req.workspace);

    if (!isAuthenticated && isProductionEnvironment) {
      addValidationRule(NoSchemaIntrospectionCustomRule);
    }
  },
});
