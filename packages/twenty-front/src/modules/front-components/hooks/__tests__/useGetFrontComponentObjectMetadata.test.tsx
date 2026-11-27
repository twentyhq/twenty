import { act, render, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { ApplicationsLoadEffect } from '@/applications/components/ApplicationsLoadEffect';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { rotateSessionGeneration } from '@/auth/utils/rotateSessionGeneration';
import { useGetFrontComponentObjectMetadata } from '@/front-components/hooks/useGetFrontComponentObjectMetadata';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const mockQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ query: mockQuery }),
}));

const componentApplication = mockCurrentWorkspace.installedApplications[0];
const schemaApplication = { ...componentApplication, id: 'schema-application' };
const workspace = {
  ...mockCurrentWorkspace,
  installedApplications: [componentApplication, schemaApplication],
};
const opportunity = {
  ...getMockObjectMetadataItemOrThrow('opportunity'),
  applicationId: schemaApplication.id,
};
let store = createStore();

const scopeResponse = (ids: string[]) => ({
  data: {
    currentWorkspace: {
      id: workspace.id,
      installedApplications: ids.map((id) => ({ id })),
    },
  },
});

const renderLookup = (applicationId?: string) =>
  renderHook(() => useGetFrontComponentObjectMetadata(applicationId), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  }).result.current;

beforeEach(() => {
  store = createStore();
  mockQuery
    .mockReset()
    .mockResolvedValue(
      scopeResponse([componentApplication.id, schemaApplication.id]),
    );
  store.set(currentWorkspaceState.atom, workspace);
  store.set(isCookieAuthActiveState.atom, true);
  store.set(isCurrentUserLoadedState.atom, true);
  setTestObjectMetadataItemsInMetadataStore(store, [opportunity]);
});

it('reads the latest display schema contributed by another installed app', async () => {
  const read = renderLookup(componentApplication.id);
  const original = await read('opportunity');
  const stage = original?.fields.find(({ name }) => name === 'stage');

  expect(mockQuery).not.toHaveBeenCalled();
  expect(original?.labelSingular).toBe(opportunity.labelSingular);
  expect(stage?.options?.[0]).toEqual({
    label: expect.any(String),
    value: expect.any(String),
    position: expect.any(Number),
    color: expect.any(String),
  });
  expect(stage).not.toHaveProperty('settings');
  expect(original).not.toHaveProperty('indexMetadatas');

  setTestObjectMetadataItemsInMetadataStore(store, [
    { ...opportunity, labelSingular: 'Deal' },
  ]);

  expect((await read('opportunity'))?.labelSingular).toBe('Deal');
});

it('withholds cached metadata from another workspace or an uninstalled caller', async () => {
  await expect(
    renderLookup('uninstalled-app')('opportunity'),
  ).resolves.toBeNull();

  const read = renderLookup(componentApplication.id);
  setTestObjectMetadataItemsInMetadataStore(store, [
    { ...opportunity, applicationId: 'another-workspace-installation' },
  ]);
  await expect(read('opportunity')).resolves.toBeNull();

  setTestObjectMetadataItemsInMetadataStore(store, [opportunity]);
  store.set(currentWorkspaceState.atom, {
    ...workspace,
    id: 'other-workspace',
    installedApplications: [
      { ...componentApplication, id: 'other-installation' },
    ],
  });
  await expect(read('opportunity')).resolves.toBeNull();
});

it('checks an installation missing from bootstrap once for simultaneous lookups', async () => {
  store.set(currentWorkspaceState.atom, {
    ...workspace,
    installedApplications: [schemaApplication],
  });
  const read = renderLookup(componentApplication.id);
  await expect(read('unknown')).resolves.toBeNull();
  expect(mockQuery).not.toHaveBeenCalled();

  const [first, second] = await Promise.all([
    read('opportunity'),
    read('opportunity'),
  ]);
  expect(first?.labelSingular).toBe(opportunity.labelSingular);
  expect(second).toEqual(first);
  await read('opportunity');
  expect(mockQuery).toHaveBeenCalledTimes(1);
});

it('stops returning schema when a delivered installation event invalidates bootstrap', async () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ApplicationsLoadEffect />
      </MemoryRouter>
    </Provider>,
  );
  const read = renderLookup(componentApplication.id);
  await expect(read('opportunity')).resolves.not.toBeNull();
  mockQuery.mockResolvedValue(scopeResponse([schemaApplication.id]));
  act(() =>
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'application',
      operation: { type: 'delete', deletedRecordId: componentApplication.id },
    }),
  );
  await expect(read('opportunity')).resolves.toBeNull();
  await expect(read('opportunity')).resolves.toBeNull();
  expect(mockQuery).toHaveBeenCalledTimes(1);

  mockQuery.mockResolvedValue(
    scopeResponse([componentApplication.id, schemaApplication.id]),
  );
  act(() => dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME));
  await expect(read('opportunity')).resolves.not.toBeNull();
  expect(mockQuery).toHaveBeenCalledTimes(2);
});

it('uses the authenticated workspace before bootstrap finishes', async () => {
  const read = renderLookup(componentApplication.id);
  store.set(isCurrentUserLoadedState.atom, false);
  await expect(read('opportunity')).resolves.not.toBeNull();
  expect(mockQuery).toHaveBeenCalledTimes(1);
});

it('discards an in-flight workspace check if the session rotates', async () => {
  const read = renderLookup(componentApplication.id);
  store.set(isCurrentUserLoadedState.atom, false);
  const pending = read('opportunity');
  rotateSessionGeneration();
  await expect(pending).resolves.toBeNull();
  await expect(read('opportunity')).resolves.toBeNull();
  expect(mockQuery).toHaveBeenCalledTimes(1);
});
