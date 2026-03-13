import { useCallback, useMemo } from 'react';
import { useAtom, useStore } from 'jotai';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { prepareBodyWithSignedUrls } from '@/blocknote-editor/utils/prepareBodyWithSignedUrls';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { t } from '@lingui/core/macro';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

type RichTextFieldEditorProps = {
  recordId: string;
  objectNameSingular: string;
  fieldName: string;
};

export const RichTextFieldEditor = ({
  recordId,
  objectNameSingular,
  fieldName,
}: RichTextFieldEditorProps) => {
  const store = useStore();
  const [recordInStore] = useAtom(recordStoreFamilyState.atomFamily(recordId));

  const cache = useApolloCoreClient().cache;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  const { updateOneRecord } = useUpdateOneRecord();

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
    fieldMetadataId: fieldMetadataItem?.id ?? '',
  });

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const focusId = `${recordId}-${fieldName}`;

  const persistBodyDebounced = useDebouncedCallback((blocknote: string) => {
    if (isRecordFieldReadOnly === true) return;

    updateOneRecord({
      idToUpdate: recordId,
      objectNameSingular,
      updateOneRecordInput: {
        [fieldName]: {
          blocknote,
          markdown: null,
        },
      },
    });
  }, 300);

  const handleBodyChange = useCallback(
    (newStringifiedBody: string) => {
      const oldRecord = store.get(recordStoreFamilyState.atomFamily(recordId));

      store.set(
        recordStoreFamilyState.atomFamily(recordId),
        (prev: typeof oldRecord) => ({
          ...prev,
          id: recordId,
          [fieldName]: {
            blocknote: newStringifiedBody,
            markdown: null,
          },
          __typename: prev?.__typename ?? objectNameSingular,
        }),
      );

      modifyRecordFromCache({
        recordId,
        fieldModifiers: {
          [fieldName]: () => ({
            blocknote: newStringifiedBody,
            markdown: null,
          }),
        },
        cache,
        objectMetadataItem,
      });

      persistBodyDebounced(prepareBodyWithSignedUrls(newStringifiedBody));
    },
    [
      store,
      recordId,
      fieldName,
      cache,
      objectMetadataItem,
      persistBodyDebounced,
    ],
  );

  const handleBodyChangeDebounced = useDebouncedCallback(handleBodyChange, 500);

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';

    handleBodyChangeDebounced(newStringifiedBody);
  };

  const fieldValue = isDefined(recordInStore)
    ? (recordInStore as Record<string, { blocknote?: string | null }>)?.[
        fieldName
      ]
    : null;

  const initialBody = useMemo(() => {
    if (!isDefined(fieldValue)) {
      return undefined;
    }

    return parseInitialBlocknote(
      fieldValue?.blocknote,
      `Failed to parse body for field ${fieldName} on record ${recordId}`,
    );
  }, [fieldValue, fieldName, recordId]);

  const editor = useCreateBlockNote({
    initialContent: initialBody,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    placeholders: {
      default: t`Type '/' for commands, '@' for mentions`,
    },
  });

  const handleBlockEditorFocus = useCallback(() => {
    pushFocusItemToFocusStack({
      component: {
        instanceId: focusId,
        type: FocusComponentType.ACTIVITY_RICH_TEXT_EDITOR,
      },
      focusId,
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  }, [focusId, pushFocusItemToFocusStack]);

  const handleBlockEditorBlur = useCallback(() => {
    removeFocusItemFromFocusStackById({ focusId });
  }, [focusId, removeFocusItemFromFocusStackById]);

  return (
    <BlockEditor
      onFocus={handleBlockEditorFocus}
      onBlur={handleBlockEditorBlur}
      onChange={handleEditorChange}
      editor={editor}
      readonly={isRecordFieldReadOnly}
    />
  );
};
