import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { INCONSISTENT_METADATA_STORE_RESYNC_DELAY_MS } from '@/metadata-store/constants/InconsistentMetadataStoreResyncDelayMs';
import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import {
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { act, render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

const buildTarget = (targetObjectMetadataId: string) => ({
  targetObjectMetadata: {
    id: targetObjectMetadataId,
    nameSingular: targetObjectMetadataId,
    namePlural: `${targetObjectMetadataId}s`,
  },
});

const NOTE_TARGET_FIELD = {
  id: 'note-target-target',
  name: 'target',
  objectMetadataId: 'note-target',
  morphRelations: [buildTarget('company'), buildTarget('garden')],
};

const COMPANY_GARDENS_FIELD = {
  id: 'company-gardens',
  name: 'gardens',
  objectMetadataId: 'company',
  relation: buildTarget('garden'),
};

const GARDEN_NAME_FIELD = {
  id: 'garden-name',
  name: 'name',
  objectMetadataId: 'garden',
};

const seedEntity = (
  store: ReturnType<typeof createStore>,
  key: MetadataEntityKey,
  current: object[],
) =>
  store.set(metadataStoreState.atomFamily(key), {
    current,
    draft: [],
    status: 'up-to-date',
  });

const getCurrentIds = (
  store: ReturnType<typeof createStore>,
  key: MetadataEntityKey,
) =>
  (
    store.get(metadataStoreState.atomFamily(key)).current as { id: string }[]
  ).map(({ id }) => id);

const getCurrentNoteTargetMorphTargetIds = (
  store: ReturnType<typeof createStore>,
) =>
  (
    store.get(metadataStoreState.atomFamily('fieldMetadataItems'))
      .current as (typeof NOTE_TARGET_FIELD)[]
  )
    .find(({ id }) => id === NOTE_TARGET_FIELD.id)
    ?.morphRelations.map(({ targetObjectMetadata }) => targetObjectMetadata.id);

const dispatchSseMessage = async (
  events: {
    metadataName: 'objectMetadata' | 'fieldMetadata';
    operation: MetadataOperation<Record<string, unknown>>;
  }[],
) => {
  await act(async () => {
    for (const event of events) {
      dispatchMetadataOperationBrowserEvent(event);
    }
  });
};

const renderEffect = () => {
  const store = createStore();

  seedEntity(store, 'objectMetadataItems', [
    { id: 'note-target' },
    { id: 'company' },
    { id: 'garden' },
  ]);
  seedEntity(store, 'fieldMetadataItems', [
    NOTE_TARGET_FIELD,
    COMPANY_GARDENS_FIELD,
    GARDEN_NAME_FIELD,
  ]);

  render(
    <Provider store={store}>
      <MetadataStoreSSEEffect />
    </Provider>,
  );

  return store;
};

describe('MetadataStoreSSEEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('removes a deleted object together with every field that references it', async () => {
    const store = renderEffect();

    await dispatchSseMessage([
      {
        metadataName: 'objectMetadata',
        operation: { type: 'delete', deletedRecordId: 'garden' },
      },
    ]);

    expect(getCurrentIds(store, 'objectMetadataItems')).toEqual([
      'note-target',
      'company',
    ]);
    expect(getCurrentIds(store, 'fieldMetadataItems')).toEqual([
      NOTE_TARGET_FIELD.id,
    ]);
    expect(getCurrentNoteTargetMorphTargetIds(store)).toEqual(['company']);
  });

  it('keeps a stale morph target out of the store and resyncs when nothing fixes it', async () => {
    const store = renderEffect();

    await dispatchSseMessage([
      {
        metadataName: 'objectMetadata',
        operation: { type: 'delete', deletedRecordId: 'garden' },
      },
    ]);

    await dispatchSseMessage([
      {
        metadataName: 'fieldMetadata',
        operation: { type: 'update', updatedRecord: NOTE_TARGET_FIELD },
      },
    ]);

    expect(getCurrentNoteTargetMorphTargetIds(store)).toEqual(['company']);
    expect(store.get(metadataLoadedVersionState.atom)).toBe(0);

    act(() => {
      jest.advanceTimersByTime(INCONSISTENT_METADATA_STORE_RESYNC_DELAY_MS);
    });

    expect(store.get(metadataLoadedVersionState.atom)).toBe(1);
    expect(getCurrentNoteTargetMorphTargetIds(store)).toEqual(['company']);
  });

  it('waits for the object of a created field before applying it', async () => {
    const store = renderEffect();

    await dispatchSseMessage([
      {
        metadataName: 'fieldMetadata',
        operation: {
          type: 'create',
          createdRecord: {
            id: 'orchard-name',
            name: 'name',
            objectMetadataId: 'orchard',
          },
        },
      },
    ]);

    expect(getCurrentIds(store, 'fieldMetadataItems')).not.toContain(
      'orchard-name',
    );

    await dispatchSseMessage([
      {
        metadataName: 'objectMetadata',
        operation: { type: 'create', createdRecord: { id: 'orchard' } },
      },
    ]);

    expect(getCurrentIds(store, 'objectMetadataItems')).toContain('orchard');
    expect(getCurrentIds(store, 'fieldMetadataItems')).toContain(
      'orchard-name',
    );

    act(() => {
      jest.advanceTimersByTime(INCONSISTENT_METADATA_STORE_RESYNC_DELAY_MS);
    });

    expect(store.get(metadataLoadedVersionState.atom)).toBe(0);
  });
});
