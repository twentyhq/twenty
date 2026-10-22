import { useCallback } from 'react';
import { useAtom, useStore } from 'jotai';

import { type Attachment } from '@/activities/files/types/Attachment';
import { useAttachmentSync } from '@/activities/files/hooks/useAttachmentSync';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import { AdvancedTextEditorBlockHandle } from '@/advanced-text-editor/components/AdvancedTextEditorBlockHandle';
import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { type UploadErrorHandler } from '@/advanced-text-editor/types/UploadErrorHandler';
import { getStorableEditorDocument } from '@/advanced-text-editor/utils/getStorableEditorDocument';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RICH_TEXT_FIELD_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/object-record/record-field/ui/meta-types/input/constants/RichTextFieldEditorGlobalHotkeysConfig';
import { RICH_TEXT_FIELD_EDITOR_PROFILE } from '@/object-record/record-field/ui/meta-types/input/constants/RichTextFieldEditorProfile';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
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
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';

const StyledEditorContainer = styled.div`
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[8]};
  position: relative;
  width: 100%;
`;

type RichTextFieldEditorProps = {
  recordId: string;
  objectNameSingular: string;
  fieldName: string;
  onPersistBody?: (tiptap: string) => void;
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

  const attachmentTargetFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: objectNameSingular,
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

  const { searchMentionRecords } = useMentionSearch();

  const { enqueueToast } = useToast();

  const handleUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await uploadAttachmentFile(file, {
      id: recordId,
      targetObjectNameSingular: objectNameSingular,
    });

    return { url: attachmentAbsoluteURL };
  };

  const handleUploadFileError: UploadErrorHandler = ({ file }) => {
    enqueueToast({
      status: 'error',
      children: t`Failed to upload "${file.name}"`,
    });
  };

  const fieldValue: FieldRichTextValue | undefined = recordInStore?.[fieldName];

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
        if (isRecordFieldReadOnly === true) return;

        if (onPersistBody) {
          onPersistBody(tiptap);
          return;
        }

        updateOneRecord({
          idToUpdate: recordId,
          objectNameSingular,
          updateOneRecordInput: {
            [fieldName]: {
              blocknote: null,
              markdown: null,
              tiptap,
            },
          },
        });
      },
    });

  const handleBodyChange = async (newSerializedDocument: string) => {
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

    // Only after capturing the pre-edit body: persisting rewrites the record, so the diff would miss removed attachments.
    updateDraft({ tiptap: stripRichTextFileUrlTokens(newSerializedDocument) });

    await syncAttachments(
      newSerializedDocument,
      getRichTextFieldSerializedContent(oldFieldValue),
    );
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
