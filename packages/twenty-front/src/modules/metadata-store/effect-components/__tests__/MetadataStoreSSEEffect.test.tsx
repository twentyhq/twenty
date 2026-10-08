import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { AllMetadataName } from '~/generated-metadata/graphql';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const ROCKET_OBJECT_METADATA_ID = '20202020-0000-4000-8000-0000000000aa';
const ROCKET_MORPH_ROW_ID = '20202020-0000-4000-8000-0000000000bb';

const getObjectMetadataItemOrThrow = (nameSingular: string) => {
  const objectMetadataItem = jotaiStore
    .get(objectMetadataItemsSelector.atom)
    .find((item) => item.nameSingular === nameSingular);

  if (!isDefined(objectMetadataItem)) {
    throw new Error(`Missing ${nameSingular} object metadata`);
  }

  return objectMetadataItem;
};

const getNoteTargetMorphFields = () => {
  const noteTargetObjectMetadataId =
    getObjectMetadataItemOrThrow('noteTarget').id;

  return (
    jotaiStore.get(metadataStoreState.atomFamily('fieldMetadataItems'))
      .current as FlatFieldMetadataItem[]
  ).filter(
    (field) =>
      field.objectMetadataId === noteTargetObjectMetadataId &&
      field.type === FieldMetadataType.MORPH_RELATION,
  );
};

const resolveNoteMorphJunctionConfig = () =>
  getObjectMorphJunctionConfig({
    objectMetadata: getObjectMetadataItemOrThrow('note'),
    objectMetadataItems: jotaiStore.get(objectMetadataItemsSelector.atom),
  });

const dispatchFieldMetadataEvents = (
  operations: Parameters<
    typeof dispatchMetadataOperationBrowserEvent<FlatFieldMetadataItem>
  >[0]['operation'][],
) =>
  act(() => {
    for (const operation of operations) {
      dispatchMetadataOperationBrowserEvent<FlatFieldMetadataItem>({
        metadataName: AllMetadataName.fieldMetadata,
        operation,
      });
    }
  });

describe('MetadataStoreSSEEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );

    render(
      <JotaiProvider store={jotaiStore}>
        <MetadataStoreSSEEffect />
      </JotaiProvider>,
    );
  });

  it('keeps the note morph junction resolvable while the collapsed morph field changes representative', () => {
    const [standardMorphField] = getNoteTargetMorphFields();
    const standardMorphRelations = standardMorphField.morphRelations ?? [];
    const rocketMorphRelation = {
      ...standardMorphRelations[0],
      sourceFieldMetadata: {
        ...standardMorphRelations[0].sourceFieldMetadata,
        id: ROCKET_MORPH_ROW_ID,
      },
      targetObjectMetadata: {
        ...standardMorphRelations[0].targetObjectMetadata,
        id: ROCKET_OBJECT_METADATA_ID,
        nameSingular: 'rocket',
        namePlural: 'rockets',
      },
    };

    expect(resolveNoteMorphJunctionConfig()).not.toBeNull();

    // A new target object's row became the representative of the group
    dispatchFieldMetadataEvents([
      {
        type: 'create',
        createdRecord: {
          ...standardMorphField,
          id: ROCKET_MORPH_ROW_ID,
          morphRelations: [...standardMorphRelations, rocketMorphRelation],
        },
      },
      { type: 'delete', deletedRecordId: standardMorphField.id },
    ]);

    expect(getNoteTargetMorphFields().map(({ id }) => id)).toEqual([
      ROCKET_MORPH_ROW_ID,
    ]);
    expect(resolveNoteMorphJunctionConfig()).not.toBeNull();

    // That target object was deleted, so a standard row represents the group again
    dispatchFieldMetadataEvents([
      { type: 'create', createdRecord: standardMorphField },
      { type: 'delete', deletedRecordId: ROCKET_MORPH_ROW_ID },
    ]);

    expect(getNoteTargetMorphFields()).toEqual([standardMorphField]);
    expect(resolveNoteMorphJunctionConfig()).not.toBeNull();
  });
});
