import { useCallback, useMemo } from 'react';

import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { type Attachment } from '@/activities/files/types/Attachment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { DashboardsBlockEditor } from '@/page-layout/widgets/standalone-rich-text/components/DashboardsBlockEditor';
import { StandaloneRichTextWidgetAutoFocusEffect } from '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextWidgetAutoFocusEffect';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/ui/input/editor/constants/BlockEditorGlobalHotkeysConfig';
import { useAttachmentSync } from '@/ui/input/editor/hooks/useAttachmentSync';
import { parseInitialBlocknote } from '@/ui/input/editor/utils/parseInitialBlocknote';
import { prepareBodyWithSignedUrls } from '@/ui/input/editor/utils/prepareBodyWithSignedUrls';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { t } from '@lingui/core/macro';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { useRecoilCallback } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

type StandaloneRichTextEditorContentProps = {
  widget: PageLayoutWidget;
  dashboardId: string;
  currentBody: string;
  attachments: Attachment[];
  isEditable: boolean;
  containerElement: HTMLDivElement | null;
};

export const StandaloneRichTextEditorContent = ({
  widget,
  dashboardId,
  currentBody,
  attachments,
  isEditable,
  containerElement,
}: StandaloneRichTextEditorContentProps) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget();
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const isPageLayoutInEditModeState = useRecoilComponentCallbackState(
    isPageLayoutInEditModeComponentState,
  );
  const pageLayoutEditingWidgetIdState = useRecoilComponentCallbackState(
    pageLayoutEditingWidgetIdComponentState,
  );

  const { syncAttachments } = useAttachmentSync(attachments);

  const shouldPersistDraft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isPageLayoutInEditMode = snapshot
          .getLoadable(isPageLayoutInEditModeState)
          .getValue();
        const editingWidgetId = snapshot
          .getLoadable(pageLayoutEditingWidgetIdState)
          .getValue();

        return isPageLayoutInEditMode && editingWidgetId === widget.id;
      },
    [isPageLayoutInEditModeState, pageLayoutEditingWidgetIdState, widget.id],
  );

  const handleUploadAttachment = async (file: File) => {
    return await uploadAttachmentFile(file, {
      id: dashboardId,
      targetObjectNameSingular: CoreObjectNameSingular.Dashboard,
    });
  };

  const handleEditorBuiltInUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await handleUploadAttachment(file);
    return attachmentAbsoluteURL;
  };

  const initialContent = useMemo(
    () => parseInitialBlocknote(currentBody),
    [currentBody],
  );

  const editor = useCreateBlockNote({
    initialContent,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    uploadFile: handleEditorBuiltInUploadFile,
    sideMenuDetection: 'editor',
    placeholders: {
      default: t`Type '/' for commands, '@' for mentions`,
    },
  });

  const handlePersistBody = useDebouncedCallback((blocknote: string) => {
    if (!shouldPersistDraft()) {
      return;
    }
    updatePageLayoutWidget(widget.id, {
      configuration: {
        configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
        body: {
          blocknote,
          markdown: null,
        },
      },
    });
  }, 300);

  const handleAttachmentSync = useDebouncedCallback(
    async (newStringifiedBody: string, previousBody: string) => {
      if (!shouldPersistDraft()) {
        return;
      }
      await syncAttachments(newStringifiedBody, previousBody);
    },
    500,
  );

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';
    const preparedBody = prepareBodyWithSignedUrls(newStringifiedBody);

    handlePersistBody(preparedBody);
    handleAttachmentSync(newStringifiedBody, currentBody);
  };

  const handleBlockEditorFocus = useCallback(() => {
    pushFocusItemToFocusStack({
      component: {
        instanceId: widget.id,
        type: FocusComponentType.STANDALONE_RICH_TEXT_WIDGET,
      },
      focusId: widget.id,
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  }, [pushFocusItemToFocusStack, widget.id]);

  const handleBlockEditorBlur = useCallback(() => {
    handlePersistBody.flush();
    removeFocusItemFromFocusStackById({
      focusId: widget.id,
    });
  }, [handlePersistBody, removeFocusItemFromFocusStackById, widget.id]);

  return (
    <>
      <StandaloneRichTextWidgetAutoFocusEffect
        shouldFocus={isEditable}
        editor={editor}
        containerElement={containerElement}
      />
      <DashboardsBlockEditor
        onFocus={handleBlockEditorFocus}
        onBlur={handleBlockEditorBlur}
        onChange={handleEditorChange}
        editor={editor}
        readonly={!isEditable}
        boundaryElement={containerElement}
      />
    </>
  );
};
