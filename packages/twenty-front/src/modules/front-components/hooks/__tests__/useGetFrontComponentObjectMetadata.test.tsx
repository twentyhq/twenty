import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { rotateSessionGeneration } from '@/auth/utils/rotateSessionGeneration';
import { useGetFrontComponentObjectMetadata } from '@/front-components/hooks/useGetFrontComponentObjectMetadata';
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
const store = createStore();

const renderLookup = (applicationId?: string) =>
  renderHook(() => useGetFrontComponentObjectMetadata(applicationId), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  }).result.current;

beforeEach(() => {
  store.set(currentWorkspaceState.atom, workspace);
  store.set(isCookieAuthActiveState.atom, true);
  store.set(isCurrentUserLoadedState.atom, true);
  setTestObjectMetadataItemsInMetadataStore(store, [opportunity]);
});

it('reads the latest display schema contributed by another installed app', async () => {
  const read = renderLookup(componentApplication.id);
  const original = await read('opportunity');
  const stage = original?.fields.find(({ name }) => name === 'stage');

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

it('requires an authenticated session and stops serving a worker after session rotation', async () => {
  const read = renderLookup(componentApplication.id);
  store.set(isCurrentUserLoadedState.atom, false);
  await expect(read('opportunity')).resolves.toBeNull();
  store.set(isCurrentUserLoadedState.atom, true);
  await expect(read('opportunity')).resolves.not.toBeNull();
  rotateSessionGeneration();
  await expect(read('opportunity')).resolves.toBeNull();
});
