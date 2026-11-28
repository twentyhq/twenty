import { useCallback, useState } from 'react';
import { useAtom, useStore } from 'jotai';

import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import { AdvancedTextEditorBlockHandle } from '@/advanced-text-editor/components/AdvancedTextEditorBlockHandle';
import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { type UploadErrorHandler } from '@/advanced-text-editor/types/UploadErrorHandler';
import { getStorableEditorDocument } from '@/advanced-text-editor/utils/getStorableEditorDocument';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RICH_TEXT_FIELD_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/object-record/record-field/ui/meta-types/input/constants/RichTextFieldEditorGlobalHotkeysConfig';
import { RICH_TEXT_FIELD_EDITOR_PROFILE } from '@/object-record/record-field/ui/meta-types/input/constants/RichTextFieldEditorProfile';
import {
  type FieldFilesValue,
  type FieldRichTextValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeRichTextFieldFilesToPersist } from '@/object-record/record-field/ui/utils/computeRichTextFieldFilesToPersist';
import { getRichTextFieldSerializedContent } from '@/object-record/record-field/ui/utils/getRichTextFieldSerializedContent';
import { stripRichTextFileUrlTokens } from '@/object-record/record-field/ui/utils/stripRichTextFileUrlTokens';
import { useRecordSeededDraft } from '@/object-record/record-seeded-draft/hooks/useRecordSeededDraft';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { type Editor } from '@tiptap/core';
import { Key } from 'ts-key-enum';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { useDebouncedCallback } from 'use-debounce';
import { useLingui } from '@lingui/react/macro';
import { FileFolder } from '~/generated-metadata/graphql';

const StyledEditorContainer = styled.div`
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  position: relative;
  width: 100%;
`;

type RichTextFieldEditorProps = {
  recordId: string;
  objectNameSingular: string;
  fieldName: string;
  onPersistBody?: (richTextValue: FieldRichTextValue) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  editorRef?: React.MutableRefObject<Editor | null>;
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
  const { t } = useLingui();
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

  const fieldValue: FieldRichTextValue | undefined = recordInStore?.[fieldName];

  const [uploadedFiles, setUploadedFiles] = useState<
    Pick<FieldFilesValue, 'fileId' | 'label'>[]
  >([]);
  // The local body value written on each edit has no files: the list the server last sent is kept here.
  const [listedFiles, setListedFiles] = useState<FieldFilesValue[]>([]);
  const listedFilesInStore = fieldValue?.files;

  if (isDefined(listedFilesInStore) && listedFilesInStore !== listedFiles) {
    setListedFiles(listedFilesInStore);
  }

  const { uploadFile } = useDirectFileUpload();

  const { searchMentionRecords } = useMentionSearch();

  const { enqueueToast } = useToast();

  const handleUploadFile = async (file: File) => {
    assertIsDefinedOrThrow(
      fieldMetadataItem,
      new Error(t`Field "${fieldName}" not found`),
    );

    const uploadedFile = await uploadFile(file, {
      fileFolder: FileFolder.FilesField,
      fieldMetadataId: fieldMetadataItem.id,
    });

    setUploadedFiles((currentUploadedFiles) => [
      ...currentUploadedFiles,
      { fileId: uploadedFile.id, label: file.name },
    ]);

    return { url: uploadedFile.url };
  };

  const handleUploadFileError: UploadErrorHandler = ({ file }) => {
    enqueueToast({
      status: 'error',
      children: t`Failed to upload "${file.name}"`,
    });
  };

  const { updateDraft, markDirty, flush, draftResyncKey } =
    useRecordSeededDraft({
      upstreamDraft: {
        tiptap: stripRichTextFileUrlTokens(
          getRichTextFieldSerializedContent(fieldValue) ?? '',
        ),
      },
      persistDebounceMs: 300,
      resetKey: recordId,
      onPersist: ({ tiptap }) => {
        if (isRecordFieldReadOnly === true) {
          return;
        }

        const files = computeRichTextFieldFilesToPersist({
          listedFiles,
          uploadedFiles,
          serializedDocument: tiptap,
        });
        const richTextValue: FieldRichTextValue = {
          blocknote: null,
          markdown: null,
          tiptap,
          ...(isDefined(files) && { files }),
        };

        if (onPersistBody) {
          onPersistBody(richTextValue);
          return;
        }

        updateOneRecord({
          idToUpdate: recordId,
          objectNameSingular,
          updateOneRecordInput: { [fieldName]: richTextValue },
        });
      },
    });

  const handleBodyChange = (newSerializedDocument: string) => {
    const oldRecord = store.get(recordStoreFamilyState.atomFamily(recordId));
    const oldFieldValue: FieldRichTextValue | undefined =
      oldRecord?.[fieldName];
    const newFieldValue: FieldRichTextValue = {
      blocknote: null,
      markdown: null,
      tiptap: newSerializedDocument,
    };
    store.set(
      recordStoreFamilyState.atomFamily(recordId),
      (prev: typeof oldRecord) => ({
        ...prev,
        id: recordId,
        [fieldName]: newFieldValue,
        __typename: prev?.__typename ?? objectNameSingular,
      }),
    );

    modifyRecordFromCache({
      recordId,
      fieldModifiers: {
        [fieldName]: () => newFieldValue,
      },
      cache,
      objectMetadataItem,
    });

    updateDraft({ tiptap: stripRichTextFileUrlTokens(newSerializedDocument) });
  };

  const handleBodyChangeDebounced = useDebouncedCallback(handleBodyChange, 500);

  const handleEditorUpdate = (currentEditor: Editor) => {
    // Serialization is debounced, so mark dirty now or a remote adoption could replace in-progress typing.
    markDirty();

    handleBodyChangeDebounced(
      serializeJsonContentAsAdvancedTextEditorDocument(
        getStorableEditorDocument(currentEditor),
      ),
    );
  };

  const handleEditorFocus = useCallback(() => {
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
      globalHotkeysConfig: RICH_TEXT_FIELD_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  }, [focusId, pushFocusItemToFocusStack, onFocusOverride]);

  const handleEditorBlur = () => {
    handleBodyChangeDebounced.flush();
    flush();

    if (onBlurOverride) {
      onBlurOverride();
      return;
    }

    removeFocusItemFromFocusStackById({ focusId });
  };

  const editor = useAdvancedTextEditor(
    {
      profile: RICH_TEXT_FIELD_EDITOR_PROFILE,
      placeholder: t`Type '/' for commands, '@' for mentions`,
      readonly: isRecordFieldReadOnly,
      defaultValue: getRichTextFieldSerializedContent(fieldValue),
      onUpdate: handleEditorUpdate,
      onFocus: handleEditorFocus,
      onBlur: handleEditorBlur,
      onImageUpload: handleUploadFile,
      onImageUploadError: handleUploadFileError,
      onFileUpload: handleUploadFile,
      onFileUploadError: handleUploadFileError,
    },
    [recordId, isRecordFieldReadOnly, draftResyncKey],
  );

  if (isDefined(editorRef)) {
    editorRef.current = editor;
  }

  if (isDefined(editor)) {
    editor.extensionStorage['mention-suggestion'].searchMentionRecords =
      searchMentionRecords;
  }

  useHotkeysOnFocusedElement({
    keys: Key.Escape,
    callback: () => {
      editor?.commands.blur();
    },
    focusId,
    dependencies: [editor],
  });

  if (!isDefined(editor)) {
    return null;
  }

  return (
    <StyledEditorContainer>
      <AdvancedTextEditor
        editor={editor}
        readonly={isRecordFieldReadOnly}
        minHeight={RICH_TEXT_FIELD_EDITOR_PROFILE.minHeight}
        variant={RICH_TEXT_FIELD_EDITOR_PROFILE.variant}
      />
      {!isRecordFieldReadOnly && (
        <AdvancedTextEditorBlockHandle editor={editor} />
      )}
    </StyledEditorContainer>
  );
};
