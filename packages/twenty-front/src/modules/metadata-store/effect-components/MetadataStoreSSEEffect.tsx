import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { VIEW_FAMILY_ENTITY_KEYS } from '@/metadata-store/constants/ViewFamilyEntityKeys';
import { VIEW_FAMILY_HYDRATION_MAX_JITTER_MS } from '@/metadata-store/constants/ViewFamilyHydrationMaxJitterMs';
import { useResyncMetadataStore } from '@/metadata-store/hooks/useResyncMetadataStore';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { removedViewIdsState } from '@/metadata-store/states/removedViewIdsState';
import { viewFamilyHintState } from '@/metadata-store/states/viewFamilyHintState';
import { viewFamilyLoadEpochState } from '@/metadata-store/states/viewFamilyLoadEpochState';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { addTypenamesToFlatPageLayoutWidget } from '@/metadata-store/utils/addTypenamesToFlatPageLayoutWidget';
import { getDraftOrCurrentMetadataItems } from '@/metadata-store/utils/getDraftOrCurrentMetadataItems';
import { isViewFamilySplitModeActive } from '@/metadata-store/utils/isViewFamilySplitModeActive';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { resolveViewFamilyEventAction } from '@/metadata-store/utils/resolveViewFamilyEventAction';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type AnyMetadataEntity = MetadataEntityTypeMap[MetadataEntityKey];

const toMetadataStoreItem = (
  entityKey: MetadataEntityKey,
  record: Record<string, unknown>,
): AnyMetadataEntity =>
  entityKey === 'pageLayoutWidgets'
    ? addTypenamesToFlatPageLayoutWidget(
        record as unknown as FlatPageLayoutWidget,
      )
    : (record as unknown as AnyMetadataEntity);

export const MetadataStoreSSEEffect = () => {
  const store = useStore();
  const { addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();
  const { resyncMetadataStore } = useResyncMetadataStore();

  const applyOperation = (
    entityKey: MetadataEntityKey,
    eventDetail: MetadataOperationBrowserEventDetail<Record<string, unknown>>,
  ) => {
    const collectionHash = eventDetail.updatedCollectionHash;

    switch (eventDetail.operation.type) {
      case 'create': {
        addToDraft({
          key: entityKey,
          items: [
            toMetadataStoreItem(entityKey, eventDetail.operation.createdRecord),
          ],
          collectionHash,
        });
        break;
      }
      case 'update': {
        addToDraft({
          key: entityKey,
          items: [
            toMetadataStoreItem(entityKey, eventDetail.operation.updatedRecord),
          ],
          collectionHash,
        });
        break;
      }
      case 'delete': {
        removeFromDraft({
          key: entityKey,
          itemIds: [eventDetail.operation.deletedRecordId],
          collectionHash,
        });
        break;
      }
    }
  };

  const removeViewWithChildren = (viewId: string) => {
    removeFromDraft({ key: 'views', itemIds: [viewId] });

    for (const childEntityKey of VIEW_FAMILY_ENTITY_KEYS) {
      if (childEntityKey === 'views') {
        continue;
      }

      const childIds = getDraftOrCurrentMetadataItems({
        store,
        metadataEntityKey: childEntityKey,
      })
        .filter((child) => 'viewId' in child && child.viewId === viewId)
        .map((child) => child.id);

      removeFromDraft({ key: childEntityKey, itemIds: childIds });
    }
  };

  const handleViewFamilyEvent = (
    entityKey: MetadataEntityKey,
    eventDetail: MetadataOperationBrowserEventDetail<Record<string, unknown>>,
  ) => {
    const isSplitModeActive = isViewFamilySplitModeActive(store);

    if (isSplitModeActive) {
      store.set(viewFamilyLoadEpochState.atom, (epoch) => epoch + 1);
      store.set(viewFamilyHintState.atom, undefined);
    }

    const { operation } = eventDetail;

    if (entityKey === 'views' && operation.type === 'delete') {
      removeViewWithChildren(operation.deletedRecordId);

      if (isSplitModeActive) {
        store.set(removedViewIdsState.atom, (removedViewIds) =>
          removedViewIds.includes(operation.deletedRecordId)
            ? removedViewIds
            : [...removedViewIds, operation.deletedRecordId],
        );
      }

      return;
    }

    if (!isSplitModeActive) {
      applyOperation(entityKey, eventDetail);

      return;
    }

    const action = resolveViewFamilyEventAction({
      entityKey,
      operation,
      removedViewIds: store.get(removedViewIdsState.atom),
      knownViewIds: new Set(
        getDraftOrCurrentMetadataItems({
          store,
          metadataEntityKey: 'views',
        }).map((view) => view.id),
      ),
    });

    if (action === 'hydrate') {
      setTimeout(
        resyncMetadataStore,
        Math.random() * VIEW_FAMILY_HYDRATION_MAX_JITTER_MS,
      );

      return;
    }

    if (action === 'apply') {
      applyOperation(entityKey, eventDetail);
    }
  };

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const entityKey = mapAllMetadataNameToEntityKey(eventDetail.metadataName);

      if (!isDefined(entityKey)) {
        return;
      }

      if (VIEW_FAMILY_ENTITY_KEYS.includes(entityKey)) {
        handleViewFamilyEvent(entityKey, eventDetail);
      } else {
        applyOperation(entityKey, eventDetail);
      }

      applyChanges();
    },
  });

  return null;
};
