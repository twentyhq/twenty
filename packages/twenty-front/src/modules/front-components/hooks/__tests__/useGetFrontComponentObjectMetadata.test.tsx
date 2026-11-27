import { MockLink } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
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
import { GetWorkspaceInstalledApplicationsDocument } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

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

const workspaceResponse = (applications = workspace.installedApplications) => ({
  data: {
    currentWorkspace: {
      __typename: 'Workspace' as const,
      id: workspace.id,
      installedApplications: applications.map((application) => ({
        ...application,
        __typename: 'Application' as const,
        logoUrl: null,
      })),
    },
  },
});

const respond = jest.fn(workspaceResponse);
let link: MockLink;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider link={link}>
    <Provider store={store}>{children}</Provider>
  </MockedProvider>
);
const renderLookup = (applicationId?: string) =>
  renderHook(() => useGetFrontComponentObjectMetadata(applicationId), {
    wrapper,
  }).result.current;

beforeEach(() => {
  store = createStore();
  respond.mockReset().mockImplementation(() => workspaceResponse());
  link = new MockLink([
    {
      request: { query: GetWorkspaceInstalledApplicationsDocument },
      result: () => respond(),
      maxUsageCount: Infinity,
      delay: 0,
    },
  ]);
  store.set(currentWorkspaceState.atom, workspace);
  store.set(isCookieAuthActiveState.atom, true);
  store.set(isCurrentUserLoadedState.atom, true);
  setTestObjectMetadataItemsInMetadataStore(store, [opportunity]);
});

it('reads the latest display schema contributed by another installed app', async () => {
  const read = renderLookup(componentApplication.id);
  const original = await read('opportunity');
  const stage = original?.fields.find(({ name }) => name === 'stage');

  expect(respond).not.toHaveBeenCalled();
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
  expect(respond).not.toHaveBeenCalled();

  const [first, second] = await Promise.all([
    read('opportunity'),
    read('opportunity'),
  ]);
  expect(first?.labelSingular).toBe(opportunity.labelSingular);
  expect(second).toEqual(first);
  expect(
    store.get(currentWorkspaceState.atom)?.installedApplications,
  ).toContainEqual(
    expect.objectContaining({
      id: componentApplication.id,
      name: componentApplication.name,
    }),
  );
  await read('opportunity');
  expect(respond).toHaveBeenCalledTimes(1);
});

it('stops returning schema when a delivered installation event invalidates bootstrap', async () => {
  render(
    <MemoryRouter>
      <ApplicationsLoadEffect />
    </MemoryRouter>,
    { wrapper },
  );
  const read = renderLookup(componentApplication.id);
  await expect(read('opportunity')).resolves.not.toBeNull();
  act(() =>
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'application',
      operation: {
        type: 'update',
        updatedFields: ['version'],
        updatedRecord: { id: componentApplication.id },
      },
    }),
  );
  await expect(read('opportunity')).resolves.not.toBeNull();
  expect(respond).not.toHaveBeenCalled();
  respond.mockReturnValue(workspaceResponse([schemaApplication]));
  act(() =>
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'application',
      operation: { type: 'delete', deletedRecordId: componentApplication.id },
    }),
  );
  await expect(read('opportunity')).resolves.toBeNull();
  await expect(read('opportunity')).resolves.toBeNull();
  expect(respond).toHaveBeenCalledTimes(1);
  expect(
    store
      .get(currentWorkspaceState.atom)
      ?.installedApplications.map(({ id }) => id),
  ).toEqual([schemaApplication.id]);

  respond.mockReturnValue(workspaceResponse());
  act(() => dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME));
  await expect(read('opportunity')).resolves.not.toBeNull();
  expect(respond).toHaveBeenCalledTimes(2);
});

it('uses the authenticated workspace before bootstrap finishes', async () => {
  const read = renderLookup(componentApplication.id);
  store.set(isCurrentUserLoadedState.atom, false);
  await expect(read('opportunity')).resolves.not.toBeNull();
  expect(respond).toHaveBeenCalledTimes(1);
});

it('discards an in-flight workspace check if the session rotates', async () => {
  const read = renderLookup(componentApplication.id);
  store.set(isCurrentUserLoadedState.atom, false);
  const pending = read('opportunity');
  rotateSessionGeneration();
  await expect(pending).resolves.toBeNull();
  await expect(read('opportunity')).resolves.toBeNull();
  expect(respond).toHaveBeenCalledTimes(1);
});

it('retries a failed installation refresh before revealing schema', async () => {
  link = new MockLink([
    {
      request: { query: GetWorkspaceInstalledApplicationsDocument },
      error: new Error('Offline'),
      delay: 0,
    },
    {
      request: { query: GetWorkspaceInstalledApplicationsDocument },
      result: () => respond(),
      delay: 0,
    },
  ]);
  store.set(isCurrentUserLoadedState.atom, false);
  const read = renderLookup(componentApplication.id);
  await expect(read('opportunity')).resolves.toBeNull();
  await expect(read('opportunity')).resolves.not.toBeNull();
});

it('preserves an uninstall completed while the server response was in flight', async () => {
  store.set(isCurrentUserLoadedState.atom, false);
  const read = renderLookup(componentApplication.id);
  const pending = read('opportunity');
  store.set(currentWorkspaceState.atom, {
    ...workspace,
    installedApplications: [schemaApplication],
  });
  await expect(pending).resolves.toBeNull();
  expect(store.get(currentWorkspaceState.atom)?.installedApplications).toEqual([
    schemaApplication,
  ]);
});

it('revalidates when bootstrap replaces a previously refreshed installation list', async () => {
  store.set(isCurrentUserLoadedState.atom, false);
  respond.mockReturnValue(workspaceResponse([schemaApplication]));
  const request = { query: GetWorkspaceInstalledApplicationsDocument };
  link = new MockLink([
    { request, result: () => respond(), delay: 0 },
    { request, error: new Error('Offline'), delay: 0 },
    { request, result: () => respond(), delay: 0 },
  ]);
  const read = renderLookup(componentApplication.id);
  await expect(read('opportunity')).resolves.toBeNull();
  store.set(currentWorkspaceState.atom, workspace);
  store.set(isCurrentUserLoadedState.atom, true);
  await expect(read('opportunity')).resolves.toBeNull();
  await expect(read('opportunity')).resolves.toBeNull();
  expect(respond).toHaveBeenCalledTimes(2);
});
