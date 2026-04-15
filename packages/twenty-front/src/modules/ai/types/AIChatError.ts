import { type CombinedGraphQLErrors } from '@apollo/client/errors';

export type AIChatError = Error | CombinedGraphQLErrors;
