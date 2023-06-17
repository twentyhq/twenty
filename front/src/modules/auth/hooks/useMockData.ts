import { graphql, setupWorker } from 'msw';

import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedUsersData } from '~/testing/mock-data/users';

export function useMockData() {
  const worker = setupWorker(...graphqlMocks);
  worker.start({ quiet: true, onUnhandledRequest: 'bypass' });
}

const graphqlMocks = [
  graphql.query('GetCompanies', (req, res, ctx) => {
    return res(
      ctx.data({
        companies: mockedCompaniesData,
      }),
    );
  }),

  graphql.query('GetCurrentUser', (req, res, ctx) => {
    return res(
      ctx.data({
        users: [mockedUsersData[0]],
      }),
    );
  }),
];
