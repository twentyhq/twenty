import { useCallback, useMemo } from 'react';

import { type Attachment } from '@/activities/files/types/Attachment';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { DashboardsBlockEditor } from '@/page-layout/widgets/standalone-rich-text/components/DashboardsBlockEditor';
import { StandaloneRichTextWidgetAutoFocusEffect } from '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextWidgetAutoFocusEffect';
import { DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';
import { filterSupportedBlocks } from '@/page-layout/widgets/standalone-rich-text/utils/filterSupportedBlocks';

import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { useAttachmentSync } from '@/blocknote-editor/hooks/useAttachmentSync';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

type StandaloneRichTextEditorContentProps = {
  widget: PageLayoutWidget;
  currentBody: string;
  attachments: Attachment[];
  isEditable: boolean;
  containerElement: HTMLDivElement | null;
};

export const StandaloneRichTextEditorContent = ({
  widget,
  currentBody,
  attachments,
  isEditable,
  containerElement,
}: StandaloneRichTextEditorContentProps) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget();
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

  const initialContent = useMemo(
    () => filterSupportedBlocks(parseInitialBlocknote(currentBody)),
    [currentBody],
  );

  const editor = useCreateBlockNote({
    initialContent,
    domAttributes: { editor: { class: 'editor' } },
    schema: DASHBOARD_BLOCK_SCHEMA,
    sideMenuDetection: 'editor',
    placeholders: {
      default: t`Enter text or type '/' for commands`,
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

    handlePersistBody(newStringifiedBody);
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
