import { useApolloClient, useQuery } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { GET_MY_MESSAGE_FOLDERS } from '@/settings/accounts/graphql/queries/getMyMessageFolders';
import { SettingsApplicationConnectionMessageFolders } from '~/pages/settings/applications/components/SettingsApplicationConnectionMessageFolders';

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock(
  '@/settings/accounts/components/message-folders/SettingsAccountsMessageFoldersCard',
  () => ({
    SettingsAccountsMessageFoldersCard: () => <div>Folder picker</div>,
  }),
);

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockedUseApolloClient = useApolloClient as jest.MockedFunction<
  typeof useApolloClient
>;

const FRONT_CHANNEL = {
  id: 'channel-1',
  connectedAccountId: 'account-1',
  type: 'APP',
};

const SUPPORT_FOLDER = {
  id: 'folder-1',
  name: 'Support',
  isSynced: true,
  messageChannelId: 'channel-1',
};

const mockQueries = ({
  channels,
  folders,
}: {
  channels: (typeof FRONT_CHANNEL)[];
  folders: (typeof SUPPORT_FOLDER)[];
}) => {
  mockedUseQuery.mockImplementation(((query: unknown) => {
    if (query === GET_MY_MESSAGE_CHANNELS) {
      return { data: { myMessageChannels: channels }, loading: false };
    }

    if (query === GET_MY_MESSAGE_FOLDERS) {
      return { data: { myMessageFolders: folders }, loading: false };
    }

    return { data: undefined, loading: false };
  }) as never);
};

const renderFolders = () =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationConnectionMessageFolders connectedAccountId="account-1" />
    </I18nProvider>,
  );

describe('SettingsApplicationConnectionMessageFolders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseApolloClient.mockReturnValue({} as never);
  });

  it("lets members pick the folders of the connection's channel", async () => {
    mockQueries({ channels: [FRONT_CHANNEL], folders: [SUPPORT_FOLDER] });

    renderFolders();

    expect(screen.getByText('Folders')).toBeInTheDocument();
    expect(await screen.findByText('Folder picker')).toBeInTheDocument();
  });

  it('renders nothing for a channel without folders', () => {
    mockQueries({ channels: [FRONT_CHANNEL], folders: [] });

    renderFolders();

    expect(screen.queryByText('Folders')).not.toBeInTheDocument();
  });

  it('renders nothing for a connection without a channel', () => {
    mockQueries({ channels: [], folders: [] });

    renderFolders();

    expect(screen.queryByText('Folders')).not.toBeInTheDocument();
  });
});
