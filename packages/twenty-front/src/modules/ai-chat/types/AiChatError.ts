import { type CombinedGraphQLErrors } from '@apollo/client/errors';

export type AiChatError = Error | CombinedGraphQLErrors;
