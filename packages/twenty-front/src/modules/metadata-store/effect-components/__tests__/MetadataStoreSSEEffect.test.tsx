import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import {
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { act, render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const ACTIVITY_JUNCTIONS = [
  { objectNameSingular: 'note', junctionFieldName: 'noteTargets' },
  { objectNameSingular: 'task', junctionFieldName: 'taskTargets' },
];

const OBJECT_METADATA_ENTITY_KEYS: MetadataEntityKey[] = [
  'objectMetadataItems',
  'fieldMetadataItems',
  'indexMetadataItems',
];

const HASH_BEFORE_DELETION = 'hash-before-deletion';
const HASH_AFTER_DELETION = 'hash-after-deletion';

const findObjectMetadataItemOrThrow = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  nameSingular: string,
) => {
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === nameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(`Missing ${nameSingular} in mocks`);
  }

  return objectMetadataItem;
};

const getMorphFieldOrThrow = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  nameSingular: string,
) => {
  const morphField = findObjectMetadataItemOrThrow(
    objectMetadataItems,
    nameSingular,
  ).fields.find(({ type }) => type === FieldMetadataType.MORPH_RELATION);

  if (!isDefined(morphField)) {
    throw new Error(`Missing morph field on ${nameSingular} in mocks`);
  }

  return morphField;
};

// Matches the server: the activity junctions are configured on the standard person target row
const getObjectMetadataItemsWithPersonJunctionTargets = () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const personObjectMetadataId = findObjectMetadataItemOrThrow(
    objectMetadataItems,
    'person',
  ).id;

  return objectMetadataItems.map((objectMetadataItem) => {
    const activityJunction = ACTIVITY_JUNCTIONS.find(
      ({ objectNameSingular }) =>
        objectNameSingular === objectMetadataItem.nameSingular,
    );

    if (!isDefined(activityJunction)) {
      return objectMetadataItem;
    }

    return {
      ...objectMetadataItem,
      fields: objectMetadataItem.fields.map((field) => {
        if (field.name !== activityJunction.junctionFieldName) {
          return field;
        }

        const junctionMorphField = getMorphFieldOrThrow(
          objectMetadataItems,
          `${activityJunction.objectNameSingular}Target`,
        );
        const personTargetRowId = junctionMorphField.morphRelations?.find(
          ({ targetObjectMetadata }) =>
            targetObjectMetadata.id === personObjectMetadataId,
        )?.sourceFieldMetadata.id;

        return {
          ...field,
          settings: {
            ...field.settings,
            junctionTargetFieldId: personTargetRowId,
          },
        };
      }),
    };
  });
};

const renderMetadataStoreSSEEffect = () => {
  const store = createStore();

  setTestObjectMetadataItemsInMetadataStore(
    store,
    getObjectMetadataItemsWithPersonJunctionTargets(),
  );

  // The minimal metadata load leaves the server hash as draft hash on entries it did not refetch
  for (const key of OBJECT_METADATA_ENTITY_KEYS) {
    store.set(metadataStoreState.atomFamily(key), (prev) => ({
      ...prev,
      currentCollectionHash: HASH_BEFORE_DELETION,
      draftCollectionHash: HASH_BEFORE_DELETION,
    }));
  }

  render(
    <JotaiProvider store={store}>
      <MetadataStoreSSEEffect />
    </JotaiProvider>,
  );

  return store;
};

const dispatchFieldMetadataDeletion = (deletedFieldMetadataId: string) =>
  dispatchMetadataOperationBrowserEvent({
    metadataName: 'fieldMetadata',
    operation: { type: 'delete', deletedRecordId: deletedFieldMetadataId },
    updatedCollectionHash: HASH_AFTER_DELETION,
  });

// Same order the server broadcasts an object deletion: the object first, then every field row it owned
const dispatchObjectDeletionEvents = ({
  deletedObjectMetadataId,
  fieldMetadataItems,
}: {
  deletedObjectMetadataId: string;
  fieldMetadataItems: FlatFieldMetadataItem[];
}) => {
  const deletedFieldMetadataIds = new Set<string>();

  for (const fieldMetadataItem of fieldMetadataItems) {
    if (fieldMetadataItem.objectMetadataId === deletedObjectMetadataId) {
      deletedFieldMetadataIds.add(fieldMetadataItem.id);
    }

    for (const morphRelation of fieldMetadataItem.morphRelations ?? []) {
      if (morphRelation.targetObjectMetadata.id === deletedObjectMetadataId) {
        deletedFieldMetadataIds.add(morphRelation.sourceFieldMetadata.id);
      }
    }
  }

  act(() => {
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'objectMetadata',
      operation: { type: 'delete', deletedRecordId: deletedObjectMetadataId },
      updatedCollectionHash: HASH_AFTER_DELETION,
    });

    for (const deletedFieldMetadataId of deletedFieldMetadataIds) {
      dispatchFieldMetadataDeletion(deletedFieldMetadataId);
    }
  });
};

const getCompanyTextFieldIdsOrThrow = (
  store: ReturnType<typeof createStore>,
) => {
  const companyTextFieldIds = findObjectMetadataItemOrThrow(
    store.get(objectMetadataItemsWithFieldsSelector.atom),
    'company',
  )
    .fields.filter(({ type }) => type === FieldMetadataType.TEXT)
    .map(({ id }) => id);

  if (companyTextFieldIds.length < 2) {
    throw new Error('Missing text fields on company in mocks');
  }

  return companyTextFieldIds;
};

const isFieldMetadataInStore = (
  store: ReturnType<typeof createStore>,
  fieldMetadataId: string,
) =>
  (
    store.get(metadataStoreState.atomFamily('fieldMetadataItems'))
      .current as FlatFieldMetadataItem[]
  ).some(({ id }) => id === fieldMetadataId);

const getCollectionHashes = (store: ReturnType<typeof createStore>) =>
  OBJECT_METADATA_ENTITY_KEYS.map(
    (key) =>
      store.get(metadataStoreState.atomFamily(key)).currentCollectionHash,
  );

describe('MetadataStoreSSEEffect', () => {
  it.each([
    { junctionObjectNameSingular: 'noteTarget' },
    { junctionObjectNameSingular: 'taskTarget' },
  ])(
    'refetches objects instead of patching them when the object owning the $junctionObjectNameSingular morph representative is deleted',
    ({ junctionObjectNameSingular }) => {
      const store = renderMetadataStoreSSEEffect();
      const metadataLoadedVersionBeforeDeletion = store.get(
        metadataLoadedVersionState.atom,
      );
      const representativeMorphField = getMorphFieldOrThrow(
        store.get(objectMetadataItemsWithFieldsSelector.atom),
        junctionObjectNameSingular,
      );
      // The server collapses the morph group into the field carrying this object's row id
      const deletedObjectMetadataId =
        representativeMorphField.morphRelations?.find(
          ({ sourceFieldMetadata }) =>
            sourceFieldMetadata.id === representativeMorphField.id,
        )?.targetObjectMetadata.id;

      if (!isDefined(deletedObjectMetadataId)) {
        throw new Error('The morph representative should be one of its rows');
      }

      dispatchObjectDeletionEvents({
        deletedObjectMetadataId,
        fieldMetadataItems: store.get(
          metadataStoreState.atomFamily('fieldMetadataItems'),
        ).current as FlatFieldMetadataItem[],
      });

      const objectMetadataItems = store.get(
        objectMetadataItemsWithFieldsSelector.atom,
      );

      for (const { objectNameSingular } of ACTIVITY_JUNCTIONS) {
        expect(
          getObjectMorphJunctionConfig({
            objectMetadata: findObjectMetadataItemOrThrow(
              objectMetadataItems,
              objectNameSingular,
            ),
            objectMetadataItems,
          }),
        ).toMatchObject({
          junctionObjectMetadata: {
            nameSingular: `${objectNameSingular}Target`,
          },
          isMorphRelation: true,
        });
      }

      expect(getCollectionHashes(store)).toEqual([
        undefined,
        undefined,
        undefined,
      ]);
      expect(store.get(metadataLoadedVersionState.atom)).toBeGreaterThan(
        metadataLoadedVersionBeforeDeletion,
      );
    },
  );

  it('patches the store when a field outside any morph group is deleted', () => {
    const store = renderMetadataStoreSSEEffect();
    const metadataLoadedVersionBeforeDeletion = store.get(
      metadataLoadedVersionState.atom,
    );
    const [deletedFieldMetadataId] = getCompanyTextFieldIdsOrThrow(store);

    act(() => {
      dispatchFieldMetadataDeletion(deletedFieldMetadataId);
    });

    expect(isFieldMetadataInStore(store, deletedFieldMetadataId)).toBe(false);
    expect(getCollectionHashes(store)).toEqual([
      HASH_BEFORE_DELETION,
      HASH_AFTER_DELETION,
      HASH_BEFORE_DELETION,
    ]);
    expect(store.get(metadataLoadedVersionState.atom)).toBe(
      metadataLoadedVersionBeforeDeletion,
    );
  });

  it('keeps waiting for the refetch when field deletions follow a morph row deletion', () => {
    const store = renderMetadataStoreSSEEffect();
    const morphRowId = getMorphFieldOrThrow(
      store.get(objectMetadataItemsWithFieldsSelector.atom),
      'noteTarget',
    ).id;
    const [firstFieldMetadataId, secondFieldMetadataId] =
      getCompanyTextFieldIdsOrThrow(store);

    act(() => {
      dispatchFieldMetadataDeletion(morphRowId);
      dispatchFieldMetadataDeletion(firstFieldMetadataId);
      dispatchFieldMetadataDeletion(secondFieldMetadataId);
    });

    expect(isFieldMetadataInStore(store, firstFieldMetadataId)).toBe(false);
    expect(isFieldMetadataInStore(store, secondFieldMetadataId)).toBe(false);
    expect(getCollectionHashes(store)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });
});
