import { ApolloProvider as ApolloProviderBase } from '@apollo/client';

import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { createCaptchaRefreshLink } from '@/apollo/utils/captchaRefreshLink';

export const ApolloProvider = ({ children }: React.PropsWithChildren) => {
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const captchaRefreshLink = createCaptchaRefreshLink(requestFreshCaptchaToken);

  const apolloClient = useApolloFactory({
    connectToDevTools: true,
    extraLinks: [captchaRefreshLink],
  });

  // This will attach the right apollo client to Apollo Dev Tools
  window.__APOLLO_CLIENT__ = apolloClient;

  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
};
