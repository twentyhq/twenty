import { isDefined } from 'twenty-shared/utils';
import { ApolloLink } from '@apollo/client';
import { map } from 'rxjs';

export const createCaptchaRefreshLink = (
  requestFreshCaptchaToken: () => void,
) => {
  return new ApolloLink((operation, forward) => {
    const { variables } = operation;

    const hasCaptchaToken = isDefined(variables) && 'captchaToken' in variables;

    return forward(operation).pipe(
      map((response) => {
        if (hasCaptchaToken) {
          requestFreshCaptchaToken();
        }

        return response;
      }),
    );
  });
};
