import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';
import { SettingsAdminApps } from '@/settings/admin-panel/apps/components/SettingsAdminApps';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ApplicationRegistrationSourceType } from '~/generated-admin/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const findAllApplicationRegistrations = fn();

const meta: Meta<typeof SettingsAdminApps> = {
  title: 'Modules/Settings/AdminPanel/Apps/SettingsAdminApps',
  component: SettingsAdminApps,
  decorators: [
    (Story) => (
      <ApolloAdminClientContext.Provider value={mockedApolloClient}>
        <Story />
      </ApolloAdminClientContext.Provider>
    ),
    ToastDecorator,
    ComponentWithRouterDecorator,
  ],
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindAllApplicationRegistrations', ({ variables }) => {
          findAllApplicationRegistrations(variables);

          return HttpResponse.json({
            data: {
              findAllApplicationRegistrations: {
                __typename: 'PaginatedApplicationRegistrations',
                totalCount: 1,
                hasMore: false,
                registrations: [
                  {
                    __typename: 'ApplicationRegistration',
                    id: 'a1b2c3d4-0000-4000-8000-000000000001',
                    universalIdentifier: 'acme-app',
                    name: 'Acme app',
                    logoUrl: null,
                    galleryImagesUrls: [],
                    oAuthClientId: 'acme-app-client',
                    oAuthRedirectUris: [],
                    oAuthScopes: [],
                    sourceType: ApplicationRegistrationSourceType.NPM,
                    sourcePackage: 'acme-app',
                    latestAvailableVersion: '1.0.0',
                    isListed: true,
                    isVetted: true,
                    isPreInstalled: false,
                    isConfigured: true,
                    ownerWorkspaceId: null,
                    createdAt: '2026-01-01T00:00:00.000Z',
                    updatedAt: '2026-01-01T00:00:00.000Z',
                  },
                ],
              },
            },
          });
        }),
      ],
    },
  },
  beforeEach: async () => {
    findAllApplicationRegistrations.mockClear();
    await mockedApolloClient.clearStore();
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAdminApps>;

export const FilterPanelTogglesStayOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(await canvas.findByText('Acme app')).toBeVisible();

    const trigger = canvas.getByRole('button', { name: 'Filter' });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Filter' });
    const source = within(popup).getByRole('group', { name: 'Source' });

    expect(within(source).getByRole('switch', { name: 'NPM' })).toBeChecked();
    await userEvent.click(
      within(source).getByRole('switch', { name: 'Tarball' }),
    );
    expect(
      within(source).getByRole('switch', { name: 'Tarball' }),
    ).toBeChecked();
    await waitFor(() =>
      expect(findAllApplicationRegistrations).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sourceTypes: [
            ApplicationRegistrationSourceType.NPM,
            ApplicationRegistrationSourceType.TARBALL,
          ],
        }),
      ),
    );

    const listed = within(popup).getByRole('group', { name: 'Listed' });

    await userEvent.click(
      within(listed).getByRole('switch', { name: 'Listed' }),
    );
    await userEvent.click(
      within(listed).getByRole('switch', { name: 'Not listed' }),
    );
    expect(
      within(listed).getByRole('switch', { name: 'Listed' }),
    ).not.toBeChecked();
    expect(
      within(listed).getByRole('switch', { name: 'Not listed' }),
    ).toBeChecked();
    await waitFor(() =>
      expect(findAllApplicationRegistrations).toHaveBeenLastCalledWith(
        expect.objectContaining({ isListed: false }),
      ),
    );
    expect(
      within(popup).getByRole('group', { name: 'Configured' }),
    ).toBeVisible();
    expect(popup).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
