import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { LogConsoleAppAnalytics } from '@/log-console/components/LogConsoleAppAnalytics';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  ApplicationRegistrationSourceType,
  FindManyApplicationRegistrationsDocument,
} from '~/generated-metadata/graphql';

jest.mock('@/log-console/components/LogConsoleAppAnalyticsReport', () => ({
  LogConsoleAppAnalyticsReport: ({
    applicationRegistrationId,
  }: {
    applicationRegistrationId: string;
  }) => <div>Report for {applicationRegistrationId}</div>,
}));

jest.mock(
  '@/applications/hooks/useRefetchOnApplicationRegistrationChange',
  () => ({ useRefetchOnApplicationRegistrationChange: () => undefined }),
);

const renderWithRegistrations = (
  registrations: { id: string; name: string }[],
) => {
  resetJotaiStore();

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <MockedProvider
          mocks={[
            {
              request: { query: FindManyApplicationRegistrationsDocument },
              result: {
                data: {
                  findManyApplicationRegistrations: registrations.map(
                    (registration) => ({
                      __typename: 'ApplicationRegistration',
                      ...registration,
                      universalIdentifier: `${registration.id}-universal`,
                      sourceType: ApplicationRegistrationSourceType.LOCAL,
                      logoUrl: null,
                    }),
                  ),
                },
              },
            },
          ]}
        >
          <LogConsoleAppAnalytics />
        </MockedProvider>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('LogConsoleAppAnalytics', () => {
  it('should explain that analytics need a registered app when there is none', async () => {
    renderWithRegistrations([]);

    expect(
      await screen.findByText(
        'No app registered yet. Analytics appear here for the apps this workspace develops.',
      ),
    ).toBeInTheDocument();
  });

  it('should report on the first registered app by default', async () => {
    renderWithRegistrations([
      { id: 'registration-1', name: 'Lead scoring' },
      { id: 'registration-2', name: 'Invoice sync' },
    ]);

    expect(
      await screen.findByText('Report for registration-1'),
    ).toBeInTheDocument();
    expect(screen.getByText('Lead scoring')).toBeInTheDocument();
  });
});
