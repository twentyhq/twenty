import { GET_MY_CALENDAR_CHANNELS } from '@/settings/accounts/graphql/queries/getMyCalendarChannels';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { gql } from '@apollo/client';
import { Kind, print } from 'graphql';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const createConsolidatedAccountChannelsQueryOrThrow = (
  connectedAccountIds: string[],
) => {
  const selections = [GET_MY_MESSAGE_CHANNELS, GET_MY_CALENDAR_CHANNELS].map(
    (document) => {
      const operation = document.definitions.find(
        (definition) => definition.kind === Kind.OPERATION_DEFINITION,
      );
      const field = operation?.selectionSet.selections[0];

      if (
        !isDefined(field) ||
        field.kind !== Kind.FIELD ||
        !isDefined(field.selectionSet)
      ) {
        throw new CustomError(
          'Missing account channel selection',
          'INVALID_QUERY',
        );
      }

      return print(field.selectionSet);
    },
  );
  const variables = Object.fromEntries(
    connectedAccountIds.map((id, index) => [`connectedAccountId${index}`, id]),
  );

  const variableDefinitions = connectedAccountIds.map(
    (_, index) => `$connectedAccountId${index}: UUID!`,
  );
  const fields = connectedAccountIds.map(
    (_, index) => `
      messageChannels${index}: myMessageChannels(connectedAccountId: $connectedAccountId${index}) ${selections[0]}
      calendarChannels${index}: myCalendarChannels(connectedAccountId: $connectedAccountId${index}) ${selections[1]}
    `,
  );

  const querySource =
    connectedAccountIds.length === 0
      ? 'query ConsolidatedAccountChannels { __typename }'
      : `query ConsolidatedAccountChannels(${variableDefinitions.join(',')}) { ${fields.join('\n')} }`;

  return { query: gql(querySource), variables };
};
