import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
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

  render(
    <JotaiProvider store={store}>
      <MetadataStoreSSEEffect />
    </JotaiProvider>,
  );

  return store;
};

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
    });

    for (const deletedFieldMetadataId of deletedFieldMetadataIds) {
      dispatchMetadataOperationBrowserEvent({
        metadataName: 'fieldMetadata',
        operation: { type: 'delete', deletedRecordId: deletedFieldMetadataId },
      });
    }
  });
};

describe('MetadataStoreSSEEffect', () => {
  it.each([
    { junctionObjectNameSingular: 'noteTarget' },
    { junctionObjectNameSingular: 'taskTarget' },
  ])(
    'keeps note and task junctions resolvable when the object owning the $junctionObjectNameSingular morph representative is deleted',
    ({ junctionObjectNameSingular }) => {
      const store = renderMetadataStoreSSEEffect();
      const objectMetadataItemsBeforeDeletion = store.get(
        objectMetadataItemsWithFieldsSelector.atom,
      );
      const representativeMorphField = getMorphFieldOrThrow(
        objectMetadataItemsBeforeDeletion,
        junctionObjectNameSingular,
      );
      // The server collapses the morph group into the field carrying this custom object's row id
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

      const remainingMorphField = getMorphFieldOrThrow(
        objectMetadataItems,
        junctionObjectNameSingular,
      );

      expect(remainingMorphField.id).not.toBe(representativeMorphField.id);
      expect(
        remainingMorphField.morphRelations?.map(
          ({ targetObjectMetadata }) => targetObjectMetadata.id,
        ),
      ).toEqual(
        representativeMorphField.morphRelations
          ?.map(({ targetObjectMetadata }) => targetObjectMetadata.id)
          .filter((id) => id !== deletedObjectMetadataId),
      );
    },
  );
});
