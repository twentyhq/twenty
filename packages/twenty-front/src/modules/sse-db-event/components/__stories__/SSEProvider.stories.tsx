import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { IsMinimalMetadataReadyEffect } from '@/metadata-store/effect-components/IsMinimalMetadataReadyEffect';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { SSEProvider } from '@/sse-db-event/components/SSEProvider';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { CatalogDecorator } from 'twenty-ui/testing';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const ConnectionStatus = () => {
  const store = useStore();
  const isMinimalMetadataReady = useAtomStateValue(isMinimalMetadataReadyState);
  const sseEventStreamId = useAtomStateValue(sseEventStreamIdState);
  const sseEventStreamReady = useAtomStateValue(sseEventStreamReadyState);
  const connectionStatus = sseEventStreamReady ? 'Connected' : 'Connecting';

  return (
    <>
      <Button
        disabled={isMinimalMetadataReady}
        onClick={() =>
          setTestObjectMetadataItemsInMetadataStore(
            store,
            getTestEnrichedObjectMetadataItemsMock(),
          )
        }
      >
        Load field metadata
      </Button>
      <div role="status">
        {isNonEmptyString(sseEventStreamId)
          ? connectionStatus
          : 'Waiting for field metadata'}
      </div>
    </>
  );
};

const meta: Meta<typeof SSEProvider> = {
  title: 'Modules/SseDbEvent/SSEProvider',
  component: SSEProvider,
  decorators: [
    CatalogDecorator,
    (Story) => (
      <>
        <IsMinimalMetadataReadyEffect />
        <Story />
      </>
    ),
  ],
  args: { children: <ConnectionStatus /> },
  beforeEach: () => {
    const store = jotaiStore;

    store.set(currentUserState.atom, mockedUserData);
    store.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    store.set(isCookieAuthActiveState.atom, true);
    setTestObjectMetadataItemsInMetadataStore(
      store,
      getTestEnrichedObjectMetadataItemsMock().map((objectMetadataItem) => ({
        ...objectMetadataItem,
        fields: [],
      })),
    );
    store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
      current: [],
      draft: [],
      status: 'empty',
    });
    setTestViewsInMetadataStore(store, []);

    return () => store.get(sseClientState.atom)?.dispose();
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${REACT_APP_SERVER_BASE_URL}/metadata`, () => {
          const body = new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(
                  `event: next\ndata: ${JSON.stringify({
                    data: {
                      onEventSubscription: {
                        metadataEvents: [],
                        objectRecordEventsWithQueryIds: [],
                        queueJobEvents: [],
                      },
                    },
                  })}\n\n`,
                ),
              );
            },
          });

          return new HttpResponse(body, {
            headers: { 'Content-Type': 'text/event-stream' },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SSEProvider>;

export const WaitsForFieldMetadata: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('status')).toHaveTextContent(
      'Waiting for field metadata',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Load field metadata' }),
    );
    await canvas.findByText('Connected');
    expect(
      canvas.getByRole('button', { name: 'Load field metadata' }),
    ).toBeDisabled();
  },
};
