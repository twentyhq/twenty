import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAtom, useStore } from 'jotai';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { useAttachmentSync } from '@/blocknote-editor/hooks/useAttachmentSync';
import { useReplaceBlockEditorContent } from '@/blocknote-editor/hooks/useReplaceBlockEditorContent';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { prepareBodyWithSignedUrls } from '@/blocknote-editor/utils/prepareBodyWithSignedUrls';
import { type Attachment } from '@/activities/files/types/Attachment';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type RichTextFieldEditorProps = {
  recordId: string;
  objectNameSingular: string;
  fieldName: string;
  onPersistBody?: (blocknote: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  editorRef?: React.MutableRefObject<
    typeof BLOCK_SCHEMA.BlockNoteEditor | null
  >;
};

export const RichTextFieldEditor = ({
  recordId,
  objectNameSingular,
  fieldName,
  onPersistBody,
  onFocus: onFocusOverride,
  onBlur: onBlurOverride,
  editorRef,
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

  const isAttachmentMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
  );

  const attachmentTargetFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: objectNameSingular,
    isMorphRelation: isAttachmentMigrated,
  });

  const { records: attachments } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: {
      [attachmentTargetFieldIdName]: {
        eq: recordId,
      },
    },
  });

  const { syncAttachments } = useAttachmentSync(attachments);

  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const handleUploadAttachment = async (file: File) => {
    return await uploadAttachmentFile(file, {
      id: recordId,
      targetObjectNameSingular: objectNameSingular,
    });
  };

  const handleEditorBuiltInUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await handleUploadAttachment(file);

    return attachmentAbsoluteURL;
  };

  const persistBodyDebounced = useDebouncedCallback((blocknote: string) => {
    if (isRecordFieldReadOnly === true) return;

    if (onPersistBody) {
      onPersistBody(blocknote);
      return;
    }

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
    async (newStringifiedBody: string) => {
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

      const oldFieldValue = oldRecord?.[fieldName] as
        | { blocknote?: string | null }
        | undefined;

      await syncAttachments(newStringifiedBody, oldFieldValue?.blocknote);
    },
    [
      store,
      recordId,
      fieldName,
      objectNameSingular,
      cache,
      objectMetadataItem,
      persistBodyDebounced,
      syncAttachments,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldName, recordId]);

  const editor = useCreateBlockNote({
    initialContent: initialBody,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    uploadFile: handleEditorBuiltInUploadFile,
    placeholders: {
      default: t`Type '/' for commands, '@' for mentions`,
    },
  });

  if (editorRef) {
    editorRef.current = editor;
  }

  const { replaceBlockEditorContent } = useReplaceBlockEditorContent(
    editor,
    fieldName,
  );

  const [currentRecordId, setCurrentRecordId] = useState(recordId);

  useEffect(() => {
    if (currentRecordId !== recordId) {
      replaceBlockEditorContent(recordId);
      setCurrentRecordId(recordId);
    }
  }, [recordId, currentRecordId, replaceBlockEditorContent]);

  useHotkeysOnFocusedElement({
    keys: Key.Escape,
    callback: () => {
      editor.domElement?.blur();
    },
    focusId,
    dependencies: [editor],
  });

  const handleBlockEditorFocus = useCallback(() => {
    if (onFocusOverride) {
      onFocusOverride();
      return;
    }

    pushFocusItemToFocusStack({
      component: {
        instanceId: focusId,
        type: FocusComponentType.ACTIVITY_RICH_TEXT_EDITOR,
      },
      focusId,
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  }, [focusId, pushFocusItemToFocusStack, onFocusOverride]);

  const handleBlockEditorBlur = useCallback(() => {
    if (onBlurOverride) {
      onBlurOverride();
      return;
    }

    removeFocusItemFromFocusStackById({ focusId });
  }, [focusId, removeFocusItemFromFocusStackById, onBlurOverride]);

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
