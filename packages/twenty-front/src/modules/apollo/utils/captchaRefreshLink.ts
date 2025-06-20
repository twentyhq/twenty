import { ApolloLink } from '@apollo/client';

export const createCaptchaRefreshLink = (
  requestFreshCaptchaToken: () => void,
) => {
  return new ApolloLink((operation, forward) => {
    const { variables } = operation;

    const hasCaptchaToken = variables && 'captchaToken' in variables;

    return forward(operation).map((response) => {
      if (hasCaptchaToken) {
        requestFreshCaptchaToken();
      }

      return response;
    });
  });
};
