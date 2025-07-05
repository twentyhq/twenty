import { ApolloProvider as ApolloProviderBase } from '@apollo/client';

import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { createCaptchaRefreshLink } from '@/apollo/utils/captchaRefreshLink';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const ApolloProvider = ({ children }: React.PropsWithChildren) => {
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const captchaRefreshLink = createCaptchaRefreshLink(requestFreshCaptchaToken);

  const apolloClient = useApolloFactory({
    uri: `${REACT_APP_SERVER_BASE_URL}/metadata`,
    connectToDevTools: true, // should this be default , ie dependant on IS_DEBUG_MODE?
    extraLinks: [captchaRefreshLink],
  });

  // This will attach the right apollo client to Apollo Dev Tools
  window.__APOLLO_CLIENT__ = apolloClient;

  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
};
