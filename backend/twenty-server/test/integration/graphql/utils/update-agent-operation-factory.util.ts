import gql from 'graphql-tag';
import { AGENT_GQL_FIELDS } from 'test/integration/constants/agent-gql-fields.constants';

export const updateAgentOperation = ({
  id,
  name,
  description,
  prompt,
  modelId,
  responseFormat,
}: {
  id: string;
  name?: string;
  description?: string;
  prompt?: string;
  modelId?: string;
  responseFormat?: object;
}) => ({
  query: gql`
    mutation UpdateOneAgent($input: UpdateAgentInput!) {
      updateOneAgent(input: $input) {
        ${AGENT_GQL_FIELDS}
      }
    }
  `,
  variables: {
    input: {
      id,
      ...(name && { name }),
      ...(description && { description }),
      ...(prompt && { prompt }),
      ...(modelId && { modelId }),
      ...(responseFormat && { responseFormat }),
    },
  },
});
