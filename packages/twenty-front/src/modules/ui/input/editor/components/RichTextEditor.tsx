import { useMemo } from 'react';

import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { type Attachment } from '@/activities/files/types/Attachment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { filterAttachmentsToRestore } from '@/activities/utils/filterAttachmentsToRestore';
import { getActivityAttachmentIdsAndNameToUpdate } from '@/activities/utils/getActivityAttachmentIdsAndNameToUpdate';
import { getActivityAttachmentIdsToDelete } from '@/activities/utils/getActivityAttachmentIdsToDelete';
import { getActivityAttachmentPathsToRestore } from '@/activities/utils/getActivityAttachmentPathsToRestore';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import type { PartialBlock } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { useDebouncedCallback } from 'use-debounce';

export type RichTextEditorProps = {
  // Content
  initialBodyV2: { blocknote?: string | null; markdown?: string | null } | null;

  // Attachments
  targetableObject: ActivityTargetableObject;
  attachments: Attachment[];

  // Callbacks
  onChange: (blocknote: string) => void;

  // State
  readonly?: boolean;

  // When true, syncs external content changes to editor (for read-only viewers)
  syncExternalContent?: boolean;

  // Optional focus handling
  onFocus?: () => void;
  onBlur?: () => void;
};

export const RichTextEditor = ({
  initialBodyV2,
  targetableObject,
  attachments,
  onChange,
  readonly,
  syncExternalContent,
  onFocus,
  onBlur,
}: RichTextEditorProps) => {
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const { deleteManyRecords: deleteAttachments } = useDeleteManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const { restoreManyRecords: restoreAttachments } = useRestoreManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

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

  const handleUploadAttachment = async (file: File) => {
    return await uploadAttachmentFile(file, targetableObject);
  };

  const handleEditorBuiltInUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await handleUploadAttachment(file);

    return attachmentAbsoluteURL;
  };

  const initialContent = useMemo(() => {
    const blocknote = initialBodyV2?.blocknote;

    if (isNonEmptyString(blocknote) && blocknote !== '{}') {
      let parsedBody: PartialBlock[] | undefined = undefined;

      try {
        parsedBody = JSON.parse(blocknote);
      } catch {
        // eslint-disable-next-line no-console
        console.warn(`Failed to parse blocknote body`);
      }

      if (isArray(parsedBody) && parsedBody.length === 0) {
        return undefined;
      }

      return parsedBody;
    }

    return undefined;
  }, [initialBodyV2?.blocknote]);

  // When syncExternalContent is true, recreate editor when content changes
  // This ensures the read-only viewer stays in sync with external state
  const editorDeps =
    syncExternalContent === true ? [initialBodyV2?.blocknote] : [];

  const editor = useCreateBlockNote(
    {
      initialContent,
      domAttributes: { editor: { class: 'editor' } },
      schema: BLOCK_SCHEMA,
      uploadFile: handleEditorBuiltInUploadFile,
    },
    editorDeps,
  );

  const prepareBody = (newStringifiedBody: string) => {
    if (!newStringifiedBody) return newStringifiedBody;

    const body = JSON.parse(newStringifiedBody);

    const bodyWithSignedPayload = body.map((block: unknown) => {
      const blockRecord = block as Record<string, unknown>;
      if (
        blockRecord.type !== 'image' ||
        !(blockRecord.props as Record<string, unknown>)?.url
      ) {
        return block;
      }

      const imageProps = blockRecord.props as Record<string, unknown>;
      const imageUrl = new URL(imageProps.url as string);

      return {
        ...blockRecord,
        props: {
          ...imageProps,
          url: `${imageUrl.toString()}`,
        },
      };
    });
    return JSON.stringify(bodyWithSignedPayload);
  };

  const handleAttachmentSync = useDebouncedCallback(
    async (newStringifiedBody: string, previousBody: string) => {
      const attachmentIdsToDelete = getActivityAttachmentIdsToDelete(
        newStringifiedBody,
        attachments,
        previousBody,
      );

      if (attachmentIdsToDelete.length > 0) {
        await deleteAttachments({
          recordIdsToDelete: attachmentIdsToDelete,
        });
      }

      const attachmentPathsToRestore = getActivityAttachmentPathsToRestore(
        newStringifiedBody,
        attachments,
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
        attachments,
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
    500,
  );

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';
    const preparedBody = prepareBody(newStringifiedBody);

    onChange(preparedBody);
    handleAttachmentSync(newStringifiedBody, initialBodyV2?.blocknote ?? '');
  };

  return (
    <BlockEditor
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={handleEditorChange}
      editor={editor}
      readonly={readonly}
    />
  );
};
