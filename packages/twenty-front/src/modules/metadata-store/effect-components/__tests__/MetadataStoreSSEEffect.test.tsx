import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { act, render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

const OBJECT_METADATA_ID = 'object-metadata-id';
const KNOWN_VIEW_ID = 'known-view-id';
const RESHARED_VIEW_ID = 'reshared-view-id';

const renderEffectWithStore = () => {
  const store = createStore();

  store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
    current: [{ id: OBJECT_METADATA_ID }],
    draft: [],
    status: 'up-to-date',
    currentCollectionHash: 'objects-hash',
  });

  store.set(metadataStoreState.atomFamily('views'), {
    current: [{ id: KNOWN_VIEW_ID, objectMetadataId: OBJECT_METADATA_ID }],
    draft: [],
    status: 'up-to-date',
    currentCollectionHash: 'views-hash-1',
  });

  render(
    <JotaiProvider store={store}>
      <MetadataStoreSSEEffect />
    </JotaiProvider>,
  );

  return store;
};

const dispatchViewUpdate = (viewId: string) =>
  act(() => {
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'view',
      operation: {
        type: 'update',
        updatedRecord: { id: viewId, objectMetadataId: OBJECT_METADATA_ID },
      },
      updatedCollectionHash: 'views-hash-2',
    });
  });

describe('MetadataStoreSSEEffect', () => {
  it('should invalidate a key when an update brings a record the store does not have', () => {
    const store = renderEffectWithStore();

    dispatchViewUpdate(RESHARED_VIEW_ID);

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    expect(viewsEntry.current).toContainEqual(
      expect.objectContaining({ id: RESHARED_VIEW_ID }),
    );
    expect(viewsEntry.currentCollectionHash).toBeUndefined();
    expect(store.get(metadataLoadedVersionState.atom)).toBe(1);
  });

  it('should only upsert a record the store already has', () => {
    const store = renderEffectWithStore();

    dispatchViewUpdate(KNOWN_VIEW_ID);

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    expect(viewsEntry.currentCollectionHash).toBe('views-hash-2');
    expect(store.get(metadataLoadedVersionState.atom)).toBe(0);
  });

  it('should not invalidate a key that has not been loaded yet', () => {
    const store = renderEffectWithStore();

    act(() => {
      dispatchMetadataOperationBrowserEvent({
        metadataName: 'viewField',
        operation: {
          type: 'update',
          updatedRecord: { id: 'view-field-id', viewId: KNOWN_VIEW_ID },
        },
        updatedCollectionHash: 'view-fields-hash',
      });
    });

    expect(store.get(metadataLoadedVersionState.atom)).toBe(0);
  });
});
