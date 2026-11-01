import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_MODAL_ID } from '@/settings/admin-panel/apps/constants/ClaimApplicationRegistrationOwnershipModalId';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  ApplicationRegistrationConfigurationIssue,
  FindAdminApplicationRegistrationClaimsDocument,
  FindAdminApplicationRegistrationVariablesDocument,
} from '~/generated-admin/graphql';
import { SettingsAdminApplicationRegistrationConfigurationIssues } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationConfigurationIssues';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const mockOpenDialog = jest.fn();

jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog: mockOpenDialog, closeDialog: jest.fn() }),
}));

const APPLICATION_REGISTRATION_ID = 'a8a7d7a6-8f4e-4a43-9d5e-4f1f4b0c7e11';
const UNIVERSAL_IDENTIFIER = '0f6f3c1e-6c55-4e3a-9a59-7d2a3d4b5c6d';
const OTHER_WORKSPACE_ID = 'c2b8d1c4-3f0a-4f6e-8b2d-9e7f6a5b4c3d';

const buildVariable = ({
  key,
  isRequired,
  isFilled,
}: {
  key: string;
  isRequired: boolean;
  isFilled: boolean;
}) => ({
  __typename: 'ApplicationRegistrationVariable' as const,
  id: `${key}-id`,
  key,
  value: null,
  description: '',
  isSecret: true,
  isRequired,
  isDeprecated: false,
  isFilled,
  type: 'TEXT',
  options: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
});

const MOCKS = [
  {
    request: {
      query: FindAdminApplicationRegistrationVariablesDocument,
      variables: { applicationRegistrationId: APPLICATION_REGISTRATION_ID },
    },
    result: {
      data: {
        findAdminApplicationRegistrationVariables: [
          buildVariable({ key: 'API_KEY', isRequired: true, isFilled: false }),
          buildVariable({ key: 'API_URL', isRequired: true, isFilled: true }),
          buildVariable({
            key: 'OPTIONAL_KEY',
            isRequired: false,
            isFilled: false,
          }),
        ],
      },
    },
  },
  {
    request: {
      query: FindAdminApplicationRegistrationClaimsDocument,
      variables: { applicationRegistrationId: APPLICATION_REGISTRATION_ID },
    },
    result: {
      data: {
        findAdminApplicationRegistrationClaims: [
          {
            __typename: 'AdminApplicationRegistrationClaim' as const,
            workspaceId: OTHER_WORKSPACE_ID,
            workspaceDisplayName: 'Globex',
          },
        ],
      },
    },
  },
];

const renderConfigurationIssues = ({
  configurationIssues,
  ownerWorkspaceId = null,
}: {
  configurationIssues: ApplicationRegistrationConfigurationIssue[];
  ownerWorkspaceId?: string | null;
}) => {
  resetJotaiStore();
  jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);

  return render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <MockedProvider mocks={MOCKS}>
          <MemoryRouter>
            <SettingsAdminApplicationRegistrationConfigurationIssues
              registration={{
                id: APPLICATION_REGISTRATION_ID,
                universalIdentifier: UNIVERSAL_IDENTIFIER,
                ownerWorkspaceId,
                configurationIssues,
              }}
            />
          </MemoryRouter>
        </MockedProvider>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('SettingsAdminApplicationRegistrationConfigurationIssues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing for a configured app', () => {
    const { container } = renderConfigurationIssues({
      configurationIssues: [],
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('lists the required server variables left to set', async () => {
    renderConfigurationIssues({
      configurationIssues: [
        ApplicationRegistrationConfigurationIssue.MISSING_REQUIRED_SERVER_VARIABLES,
      ],
    });

    expect(
      await screen.findByText('Set the required server variables: API_KEY'),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Configure' })).toHaveAttribute(
      'href',
      '/#config',
    );
  });

  it('asks to claim an unowned server route app before installing it', async () => {
    renderConfigurationIssues({
      configurationIssues: [
        ApplicationRegistrationConfigurationIssue.MISSING_OWNER_WORKSPACE,
        ApplicationRegistrationConfigurationIssue.NOT_INSTALLED_ON_OWNER_WORKSPACE,
      ],
    });

    expect(
      screen.getByText(
        'Claim this app: apps exposing a server route need an owner workspace',
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Once claimed, install this app on its owner workspace to enable its server routes',
      ),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Install' }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Claim' }));

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    expect(mockOpenDialog).toHaveBeenCalledWith(
      CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_MODAL_ID,
    );
  });

  it('links to the install page when the current workspace owns the app', () => {
    renderConfigurationIssues({
      configurationIssues: [
        ApplicationRegistrationConfigurationIssue.NOT_INSTALLED_ON_OWNER_WORKSPACE,
      ],
      ownerWorkspaceId: mockCurrentWorkspace.id,
    });

    expect(
      screen.getByText(
        'Install this app on this workspace, its owner, to enable its server routes',
      ),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Install' })).toHaveAttribute(
      'href',
      `/settings/applications/available/${UNIVERSAL_IDENTIFIER}`,
    );
  });

  it('links to the owner workspace when another workspace owns the app', async () => {
    renderConfigurationIssues({
      configurationIssues: [
        ApplicationRegistrationConfigurationIssue.NOT_INSTALLED_ON_OWNER_WORKSPACE,
      ],
      ownerWorkspaceId: OTHER_WORKSPACE_ID,
    });

    expect(
      await screen.findByText(
        'Install this app on its owner workspace Globex to enable its server routes',
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'View workspace' }),
    ).toHaveAttribute(
      'href',
      `/settings/admin-panel/workspaces/${OTHER_WORKSPACE_ID}`,
    );
    expect(
      screen.queryByRole('link', { name: 'Install' }),
    ).not.toBeInTheDocument();
  });
});
