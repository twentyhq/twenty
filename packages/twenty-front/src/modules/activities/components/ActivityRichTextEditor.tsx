import { useCallback, useMemo } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';

import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { ActivityRichTextEditorChangeOnActivityIdEffect } from '@/activities/components/ActivityRichTextEditorChangeOnActivityIdEffect';
import { type Attachment } from '@/activities/files/types/Attachment';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/ui/input/editor/constants/BlockEditorGlobalHotkeysConfig';
import { useAttachmentSync } from '@/ui/input/editor/hooks/useAttachmentSync';
import { parseInitialBlocknote } from '@/ui/input/editor/utils/parseInitialBlocknote';
import { prepareBodyWithSignedUrls } from '@/ui/input/editor/utils/prepareBodyWithSignedUrls';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { isDefined } from 'twenty-shared/utils';

type ActivityRichTextEditorProps = {
  activityId: string;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;
};

export const ActivityRichTextEditor = ({
  activityId,
  activityObjectNameSingular,
}: ActivityRichTextEditorProps) => {
  const [activityInStore] = useRecoilState(recordStoreFamilyState(activityId));

  const cache = useApolloCoreClient().cache;
  const activity = activityInStore as Task | Note | null;

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const bodyV2FieldMetadataItem = objectMetadataItemActivity.fields.find(
    (field) => field.name === 'bodyV2',
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { records: attachments } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: {
      or: [
        {
          noteId: {
            eq: activityId,
          },
        },
        {
          taskId: {
            eq: activityId,
          },
        },
      ],
    },
  });

  const { syncAttachments } = useAttachmentSync(attachments);

  const { upsertActivity } = useUpsertActivity({
    activityObjectNameSingular: activityObjectNameSingular,
  });

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    recordId: activityId,
    objectMetadataId: objectMetadataItemActivity.id,
    fieldMetadataId: bodyV2FieldMetadataItem?.id ?? '',
  });

  const persistBodyDebounced = useDebouncedCallback((blocknote: string) => {
    if (isRecordFieldReadOnly === true) return;

    const input = {
      bodyV2: {
        blocknote,
        markdown: null,
      },
    };

    if (isDefined(activity)) {
      upsertActivity({
        activity,
        input,
      });
    }
  }, 300);

  const [canCreateActivity, setCanCreateActivity] = useRecoilState(
    canCreateActivityState,
  );

  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const handleUploadAttachment = async (file: File) => {
    return await uploadAttachmentFile(file, {
      id: activityId,
      targetObjectNameSingular: activityObjectNameSingular,
    });
  };

  const handlePersistBody = useCallback(
    (activityBody: string) => {
      if (!canCreateActivity) {
        setCanCreateActivity(true);
      }

      persistBodyDebounced(prepareBodyWithSignedUrls(activityBody));
    },
    [persistBodyDebounced, setCanCreateActivity, canCreateActivity],
  );

  const handleBodyChange = useRecoilCallback(
    ({ set, snapshot }) =>
      async (newStringifiedBody: string) => {
        const oldActivity = snapshot
          .getLoadable(recordStoreFamilyState(activityId))
          .getValue();

        set(recordStoreFamilyState(activityId), (oldActivity) => {
          return {
            ...oldActivity,
            id: activityId,
            bodyV2: {
              blocknote: newStringifiedBody,
              markdown: null,
            },
            __typename: 'Activity',
          };
        });

        modifyRecordFromCache({
          recordId: activityId,
          fieldModifiers: {
            bodyV2: () => {
              return {
                blocknote: newStringifiedBody,
                markdown: null,
              };
            },
          },
          cache,
          objectMetadataItem: objectMetadataItemActivity,
        });

        handlePersistBody(newStringifiedBody);

        await syncAttachments(
          newStringifiedBody,
          oldActivity?.bodyV2.blocknote,
        );
      },
    [
      activityId,
      cache,
      objectMetadataItemActivity,
      handlePersistBody,
      syncAttachments,
    ],
  );

  const handleBodyChangeDebounced = useDebouncedCallback(handleBodyChange, 500);

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';

    handleBodyChangeDebounced(newStringifiedBody);
  };

  const initialBody = useMemo(() => {
    if (!isDefined(activity)) {
      return undefined;
    }

    return parseInitialBlocknote(
      activity?.bodyV2?.blocknote,
      `Failed to parse body for activity ${activityId}, for rich text version 'v2'`,
    );
  }, [activity, activityId]);

  const handleEditorBuiltInUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await handleUploadAttachment(file);

    return attachmentAbsoluteURL;
  };

  const editor = useCreateBlockNote({
    initialContent: initialBody,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    uploadFile: handleEditorBuiltInUploadFile,
  });

  useHotkeysOnFocusedElement({
    keys: Key.Escape,
    callback: () => {
      editor.domElement?.blur();
    },
    focusId: activityId,
    dependencies: [editor],
  });

  const focusRichTextEditorWhenFocusOnSidePanel = (
    keyboardEvent: KeyboardEvent,
  ) => {
    if (keyboardEvent.key === Key.Escape) {
      return;
    }

    const isWritingText =
      !isNonTextWritingKey(keyboardEvent.key) &&
      !keyboardEvent.ctrlKey &&
      !keyboardEvent.metaKey;

    if (!isWritingText) {
      return;
    }

    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    keyboardEvent.stopImmediatePropagation();

    const newBlockId = v4();
    const newBlock = {
      id: newBlockId,
      type: 'paragraph' as const,
      content: keyboardEvent.key,
    };

    const lastBlock = editor.document[editor.document.length - 1];
    editor.insertBlocks([newBlock], lastBlock);

    editor.setTextCursorPosition(newBlockId, 'end');
    editor.focus();
  };

  useHotkeysOnFocusedElement({
    keys: '*',
    callback: focusRichTextEditorWhenFocusOnSidePanel,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [focusRichTextEditorWhenFocusOnSidePanel],
  });

  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const recordTitleCellId = getRecordFieldInputInstanceId({
    recordId: activityId,
    fieldName: labelIdentifierFieldMetadataItem?.name,
    // TODO: see comments below, this is a very temporary fix,
    //  it won't work for the breadcrumb title input, but that's ok for now.
    prefix: RecordTitleCellContainerType.ShowPage,
  });

  // TODO: Here instead of closing the input, as it was intially planned, we should block if there is anything open,
  //   This information should be derived from the focus stack
  // The problem with this library is that it takes the focus before anything else and does not prevent the event from bubbling
  //   Because of this, other events listen at the same time, and when we're in luck, the click outside gets triggered,
  //   but this leaves the door open for unpredicted behavior with click handlers conflicts,
  //   we recently had a bug which was deleting what the user typed and closed the right drawer if he used backspace key.
  // We could maybe use the types of components in the focus stack.
  const handleBlockEditorFocus = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        // TODO: Here we want to detect anything that is open to avoid conflicts with the library click event
        //   that is not prevented and propagate to other click handlers in the app.
        //  Because that is how we do in the app, for example with stacked dropdowns, we always close what's open before
        //  letting the click being captured by a button or input that can capture it.
        const isRecordTitleCellOpen = snapshot
          .getLoadable(
            isTitleCellInEditModeComponentState.atomFamily({
              instanceId: recordTitleCellId,
            }),
          )
          .getValue();

        if (isRecordTitleCellOpen) {
          editor.domElement?.blur();
          return;
        }

        pushFocusItemToFocusStack({
          component: {
            instanceId: activityId,
            type: FocusComponentType.ACTIVITY_RICH_TEXT_EDITOR,
          },
          focusId: activityId,
          globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
        });
      },
    [recordTitleCellId, activityId, editor, pushFocusItemToFocusStack],
  );

  const handlerBlockEditorBlur = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isRecordTitleCellOpen = snapshot
          .getLoadable(
            isTitleCellInEditModeComponentState.atomFamily({
              instanceId: recordTitleCellId,
            }),
          )
          .getValue();

        if (isRecordTitleCellOpen) {
          return;
        }

        removeFocusItemFromFocusStackById({
          focusId: activityId,
        });
      },
    [activityId, recordTitleCellId, removeFocusItemFromFocusStackById],
  );

  return (
    <>
      <ActivityRichTextEditorChangeOnActivityIdEffect
        editor={editor}
        activityId={activityId}
      />
      <BlockEditor
        onFocus={handleBlockEditorFocus}
        onBlur={handlerBlockEditorBlur}
        onChange={handleEditorChange}
        editor={editor}
        readonly={isRecordFieldReadOnly}
      />
    </>
  );
};
