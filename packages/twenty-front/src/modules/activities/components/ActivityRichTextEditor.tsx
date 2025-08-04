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
import { Attachment } from '@/activities/files/types/Attachment';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { filterAttachmentsToRestore } from '@/activities/utils/filterAttachmentsToRestore';
import { getActivityAttachmentIdsAndNameToUpdate } from '@/activities/utils/getActivityAttachmentIdsAndNameToUpdate';
import { getActivityAttachmentIdsToDelete } from '@/activities/utils/getActivityAttachmentIdsToDelete';
import { getActivityAttachmentPathsToRestore } from '@/activities/utils/getActivityAttachmentPathsToRestore';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/useIsRecordFieldReadOnly';
import { isInlineCellInEditModeFamilyState } from '@/object-record/record-inline-cell/states/isInlineCellInEditModeFamilyState';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import type { PartialBlock } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { isArray, isNonEmptyString } from '@sniptt/guards';
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

  const bodyV2FieldMetadataItemId = objectMetadataItemActivity.fields.find(
    (field) => field.name === 'bodyV2',
  )?.id;

  const { deleteManyRecords: deleteAttachments } = useDeleteManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const { restoreManyRecords: restoreAttachments } = useRestoreManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { fetchAllRecords: findSoftDeletedAttachments } =
    useLazyFetchAllRecords({
      objectNameSingular: CoreObjectNameSingular.Attachment,
      filter: {
        deletedAt: {
          is: 'NOT_NULL',
        },
      },
    });
  const { updateOneRecord: updateOneAttachment } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });
  const { upsertActivity } = useUpsertActivity({
    activityObjectNameSingular: activityObjectNameSingular,
  });

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    recordId: activityId,
    objectMetadataId: objectMetadataItemActivity.id,
    fieldMetadataId: bodyV2FieldMetadataItemId,
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

  const prepareBody = (newStringifiedBody: string) => {
    if (!newStringifiedBody) return newStringifiedBody;

    const body = JSON.parse(newStringifiedBody);

    const bodyWithSignedPayload = body.map((block: any) => {
      if (block.type !== 'image' || !block.props.url) {
        return block;
      }

      const imageProps = block.props;
      const imageUrl = new URL(imageProps.url);

      return {
        ...block,
        props: {
          ...imageProps,
          url: `${imageUrl.toString()}`,
        },
      };
    });
    return JSON.stringify(bodyWithSignedPayload);
  };

  const handlePersistBody = useCallback(
    (activityBody: string) => {
      if (!canCreateActivity) {
        setCanCreateActivity(true);
      }

      persistBodyDebounced(prepareBody(activityBody));
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

        const attachmentIdsToDelete = getActivityAttachmentIdsToDelete(
          newStringifiedBody,
          oldActivity?.attachments,
          oldActivity?.bodyV2.blocknote,
        );

        if (attachmentIdsToDelete.length > 0) {
          await deleteAttachments({
            recordIdsToDelete: attachmentIdsToDelete,
          });
        }

        const attachmentPathsToRestore = getActivityAttachmentPathsToRestore(
          newStringifiedBody,
          oldActivity?.attachments,
        );

        if (attachmentPathsToRestore.length > 0) {
          const softDeletedAttachments =
            (await findSoftDeletedAttachments()) as Attachment[];

          const attachmentIdsToRestore = filterAttachmentsToRestore(
            attachmentPathsToRestore,
            softDeletedAttachments,
          );

          await restoreAttachments({
            idsToRestore: attachmentIdsToRestore,
          });
        }
        const attachmentsToUpdate = getActivityAttachmentIdsAndNameToUpdate(
          newStringifiedBody,
          oldActivity?.attachments,
        );
        if (attachmentsToUpdate.length > 0) {
          for (const attachmentToUpdate of attachmentsToUpdate) {
            if (!attachmentToUpdate.id) continue;
            await updateOneAttachment({
              idToUpdate: attachmentToUpdate.id,
              updateOneRecordInput: { name: attachmentToUpdate.name },
            });
          }
        }
      },
    [
      activityId,
      cache,
      objectMetadataItemActivity,
      handlePersistBody,
      deleteAttachments,
      restoreAttachments,
      findSoftDeletedAttachments,
      updateOneAttachment,
    ],
  );

  const handleBodyChangeDebounced = useDebouncedCallback(handleBodyChange, 500);

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';

    handleBodyChangeDebounced(newStringifiedBody);
  };

  const initialBody = useMemo(() => {
    const blocknote = activity?.bodyV2?.blocknote;

    if (
      isDefined(activity) &&
      isNonEmptyString(blocknote) &&
      blocknote !== '{}'
    ) {
      let parsedBody: PartialBlock[] | undefined = undefined;

      // TODO: Remove this once we have removed the old rich text
      try {
        parsedBody = JSON.parse(blocknote);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `Failed to parse body for activity ${activityId}, for rich text version 'v2'`,
        );
        // eslint-disable-next-line no-console
        console.warn(blocknote);
      }

      if (isArray(parsedBody) && parsedBody.length === 0) {
        return undefined;
      }

      return parsedBody;
    }

    return undefined;
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

  const handleAllKeys = (keyboardEvent: KeyboardEvent) => {
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
    callback: handleAllKeys,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleAllKeys],
  });

  const { labelIdentifierFieldMetadataItem } = useRecordShowContainerData({
    objectNameSingular: activityObjectNameSingular,
    objectRecordId: activityId,
  });

  const recordTitleCellId = getRecordFieldInputInstanceId({
    recordId: activityId,
    fieldName: labelIdentifierFieldMetadataItem?.id,
    prefix: 'activity-rich-text-editor',
  });

  const handleBlockEditorFocus = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isRecordTitleCellOpen = snapshot
          .getLoadable(isInlineCellInEditModeFamilyState(recordTitleCellId))
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
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        });
      },
    [recordTitleCellId, activityId, editor, pushFocusItemToFocusStack],
  );

  const handlerBlockEditorBlur = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isRecordTitleCellOpen = snapshot
          .getLoadable(isInlineCellInEditModeFamilyState(recordTitleCellId))
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
