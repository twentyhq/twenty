import { useQuery } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import {
  ApplicationRegistrationSourceType,
  FindOneApplicationByUniversalIdentifierDocument,
} from '~/generated-metadata/graphql';
import { SettingsAvailableApplicationDetails } from '~/pages/settings/applications/SettingsAvailableApplicationDetails';

const CUSTOM_APPLICATION_ID = '5d3c1a9e-7b2f-4c8d-9e1a-3f6b8c2d4e70';
const THIRD_PARTY_APPLICATION_ID = '8f2e6d4c-1b3a-4c5d-8e7f-9a0b1c2d3e4f';

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: jest.fn(),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: jest.fn(() => ({
    workspaceCustomApplication: { id: CUSTOM_APPLICATION_ID },
    installedApplications: [
      {
        id: 'standard-application-id',
        universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      {
        id: CUSTOM_APPLICATION_ID,
        universalIdentifier: CUSTOM_APPLICATION_ID,
      },
    ],
  })),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: jest.fn(() => true),
}));

jest.mock(
  '@/marketplace/hooks/useInstallMarketplaceAppWithPermissionValidation',
  () => ({
    useInstallMarketplaceAppWithPermissionValidation: jest.fn(() => ({
      requestInstall: jest.fn(),
      install: jest.fn(),
      isInstalling: false,
      installProgress: 0,
      modalInstanceId: 'install-modal',
    })),
  }),
);

jest.mock('@/marketplace/hooks/useCopyMarketplaceAppLink', () => ({
  useCopyMarketplaceAppLink: jest.fn(() => ({
    copyMarketplaceAppLink: jest.fn(),
  })),
}));

jest.mock(
  '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal',
  () => ({
    SettingsApplicationInstallPermissionValidationModal: () => null,
  }),
);

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: jest.fn(() => jest.fn()),
}));

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  LazyMarkdownRenderer: ({ text }: { text: string }) => (
    <div data-testid="markdown-renderer">{text}</div>
  ),
}));

jest.mock('@/applications/components/AppChip', () => ({
  AppChip: () => null,
}));

jest.mock('@/settings/components/SettingsPageContainer', () => ({
  SettingsPageContainer: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/settings/components/layout/SettingsPageLayout', () => ({
  SettingsPageLayout: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

// The installed application query never resolves, so the page has to rely on the workspace state
const mockQueries = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}) => {
  mockedUseQuery.mockImplementation(((document: unknown) => {
    if (document === FindOneApplicationByUniversalIdentifierDocument) {
      return { data: undefined, loading: true };
    }

    return {
      data: {
        findMarketplaceAppDetail: {
          id: 'registration-id',
          universalIdentifier,
          name,
          sourceType: ApplicationRegistrationSourceType.LOCAL,
          isListed: false,
          isVetted: false,
          description: null,
          aboutDescription: null,
          galleryImages: [],
          installCount: 1,
          billsCredits: false,
        },
      },
      error: undefined,
      loading: false,
      refetch: jest.fn(),
    };
  }) as never);
};

const renderPage = (availableApplicationId: string) =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter
        initialEntries={[`/settings/applications/${availableApplicationId}`]}
      >
        <Routes>
          <Route
            path="/settings/applications/:availableApplicationId"
            element={<SettingsAvailableApplicationDetails />}
          />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );

const NOT_VETTED_WARNING =
  'This application is not vetted by Twenty. Use at your own risk.';

describe('SettingsAvailableApplicationDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the readme of the standard application without the not vetted warning', () => {
    mockQueries({
      universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Standard',
    });

    renderPage(TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER);

    expect(screen.queryByText(NOT_VETTED_WARNING)).not.toBeInTheDocument();
    expect(
      screen.getByText('The base data model every Twenty workspace runs on.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'Every Twenty workspace starts with this app.',
    );
  });

  it('shows the readme of the workspace custom application without the not vetted warning', () => {
    mockQueries({
      universalIdentifier: CUSTOM_APPLICATION_ID,
      name: 'Custom',
    });

    renderPage(CUSTOM_APPLICATION_ID);

    expect(screen.queryByText(NOT_VETTED_WARNING)).not.toBeInTheDocument();
    expect(
      screen.getByText("Host your workspace's customizations and overrides."),
    ).toBeInTheDocument();
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'Everything you build directly in this workspace lives here.',
    );
  });

  it('warns that a third-party application is not vetted', () => {
    mockQueries({
      universalIdentifier: THIRD_PARTY_APPLICATION_ID,
      name: 'Third party',
    });

    renderPage(THIRD_PARTY_APPLICATION_ID);

    expect(screen.getByText(NOT_VETTED_WARNING)).toBeInTheDocument();
    expect(
      screen.getByText('No description available for this application'),
    ).toBeInTheDocument();
  });
});
