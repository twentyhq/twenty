import { HttpResponse, graphql } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { fn } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

type MockedUserHealthCheckResult = {
  status: string;
  title: string | null;
  description: string | null;
  action: { label: string; location: string | null } | null;
};

export const runMyApplicationHealthCheck = fn();

const userHealthCheckResultByApplicationId = new Map<
  string,
  MockedUserHealthCheckResult
>();

export const declareUserHealthCheck = ({
  applicationId,
  result,
}: {
  applicationId: string;
  result: MockedUserHealthCheckResult;
}) => {
  userHealthCheckResultByApplicationId.set(applicationId, result);
};

export const hasDeclaredUserHealthCheck = (applicationId: string) =>
  userHealthCheckResultByApplicationId.has(applicationId);

export const failNextUserHealthCheckRequest = () => {
  getWorker().use(
    graphql.mutation(
      'RunMyApplicationHealthCheck',
      ({ variables }) => {
        runMyApplicationHealthCheck(variables);

        return HttpResponse.json({
          errors: [
            {
              message: 'Rate limit reached. Please try again later.',
              extensions: { code: 'BAD_USER_INPUT', subCode: 'LIMIT_REACHED' },
            },
          ],
        });
      },
      { once: true },
    ),
  );
};

export const USER_HEALTH_CHECK_GRAPHQL_HANDLER = graphql.mutation(
  'RunMyApplicationHealthCheck',
  ({ variables }) => {
    runMyApplicationHealthCheck(variables);

    const result = userHealthCheckResultByApplicationId.get(
      variables.applicationId,
    );

    if (!isDefined(result)) {
      return HttpResponse.json({ data: { runMyApplicationHealthCheck: null } });
    }

    const { action, ...resultFields } = result;
    const actionWithTypename = isDefined(action)
      ? { __typename: 'ApplicationHealthCheckAction', ...action }
      : null;

    return HttpResponse.json({
      data: {
        runMyApplicationHealthCheck: {
          __typename: 'ApplicationHealthCheckResult',
          ...resultFields,
          action: actionWithTypename,
        },
      },
    });
  },
);

export const resetUserHealthCheckMocks = () => {
  userHealthCheckResultByApplicationId.clear();
  runMyApplicationHealthCheck.mockClear();
};
