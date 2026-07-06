import { type PropsWithChildren } from 'react';

import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { BaseThemeProvider } from '@/ui/theme/components/BaseThemeProvider';

type SharedAppProvidersProps = PropsWithChildren;

export const SharedAppProviders = ({ children }: SharedAppProvidersProps) => {
  return (
    <ApolloProvider>
      <BaseThemeProvider>
        <ClientConfigProviderEffect />
        <ClientConfigProvider>{children}</ClientConfigProvider>
      </BaseThemeProvider>
    </ApolloProvider>
  );
};
