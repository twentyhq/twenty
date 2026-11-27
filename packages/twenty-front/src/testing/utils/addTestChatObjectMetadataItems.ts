import { type createStore } from 'jotai';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { TEST_CHAT_OBJECT_METADATA_ID } from '~/testing/constants/TestChatObjectMetadataId';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const CHAT_OBJECT_DEFINITIONS = [
  {
    id: TEST_CHAT_OBJECT_METADATA_ID,
    nameSingular: StandardObjectNameSingular.AgentChatThread,
    namePlural: 'agentChatThreads',
    labelSingular: 'Chat',
    labelPlural: 'Chats',
    labelFieldName: 'title',
    fieldNames: ['id', 'title', 'createdAt', 'updatedAt', 'deletedAt'],
  },
  {
    id: '20202020-0000-4000-8000-0000000000dd',
    nameSingular: StandardObjectNameSingular.AgentChatThreadTarget,
    namePlural: 'agentChatThreadTargets',
    labelSingular: 'Chat target',
    labelPlural: 'Chat targets',
    labelFieldName: 'id',
    fieldNames: ['id'],
  },
];

export const addTestChatObjectMetadataItems = (
  store: ReturnType<typeof createStore>,
) => {
  const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);
  const objectMetadataTemplate = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === StandardObjectNameSingular.Note,
  );

  assertIsDefinedOrThrow(objectMetadataTemplate);

  const chatObjectMetadataItems = CHAT_OBJECT_DEFINITIONS.filter(
    ({ nameSingular }) =>
      !objectMetadataItems.some(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === nameSingular,
      ),
  ).map(({ labelFieldName, fieldNames, ...objectDefinition }) => {
    const fields = objectMetadataTemplate.fields
      .filter(({ name }) => fieldNames.includes(name))
      .map((field) => {
        const id = v4();

        return {
          ...field,
          id,
          universalIdentifier: id,
          objectMetadataId: objectDefinition.id,
        };
      });
    const labelField = fields.find(({ name }) => name === labelFieldName);

    assertIsDefinedOrThrow(labelField);

    return {
      ...objectMetadataTemplate,
      ...objectDefinition,
      universalIdentifier: objectDefinition.id,
      labelIdentifierFieldMetadataId: labelField.id,
      isSystem: true,
      isSearchable: false,
      fields,
      readableFields: fields,
      updatableFields: fields,
      indexMetadatas: [],
      searchFieldMetadatas: [],
    };
  });

  setTestObjectMetadataItemsInMetadataStore(store, [
    ...objectMetadataItems,
    ...chatObjectMetadataItems,
  ]);
};
