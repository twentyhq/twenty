import { useLingui } from '@lingui/react/macro';
import { type Editor, type JSONContent } from '@tiptap/core';
import {
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react';
import { EMAIL_IMAGE_MIME_TYPES } from 'twenty-shared/constants';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components';
import { IconPaint, IconPhoto, IconVariable } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useCampaignEmailEditorVariables } from '@/activities/emails/hooks/useCampaignEmailEditorVariables';
import { useUploadEmailImage } from '@/activities/emails/hooks/useUploadEmailImage';
import { AdvancedTextEditorBlockDragOverlay } from '@/advanced-text-editor/components/AdvancedTextEditorBlockDragOverlay';
import { ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockInsertionRecipes';
import { ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS } from '@/advanced-text-editor/constants/AdvancedTextEditorTextInsertionItems';
import { useAdvancedTextEditorBlockDrag } from '@/advanced-text-editor/hooks/useAdvancedTextEditorBlockDrag';
import { type AdvancedTextEditorInsertionItem } from '@/advanced-text-editor/types/AdvancedTextEditorInsertionItem';
import { getAdvancedTextEditorBlockInsertionRange } from '@/advanced-text-editor/utils/getAdvancedTextEditorBlockInsertionRange';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { insertAdvancedTextEditorBlock } from '@/advanced-text-editor/utils/insertAdvancedTextEditorBlock';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelStepListContainer } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepContainer';
import { SidePanelWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepTitle';

const LAYOUT_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.SECTION,
  TIPTAP_NODE_TYPES.COLUMNS,
  TIPTAP_NODE_TYPES.DIVIDER,
];

const LAYOUT_INSERTION_ITEMS =
  ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.filter(({ nodeType }) =>
    LAYOUT_NODE_TYPES.includes(nodeType),
  );

const CONTENT_INSERTION_ITEMS =
  ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.filter(
    ({ nodeType }) => !LAYOUT_NODE_TYPES.includes(nodeType),
  );

type EmailBlockInsertListProps = {
  editor: Editor;
};

export const EmailBlockInsertList = ({ editor }: EmailBlockInsertListProps) => {
  const { i18n, t } = useLingui();
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { variables } = useCampaignEmailEditorVariables();
  const { uploadEmailImage } = useUploadEmailImage();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const { draggedBlock, dropIndicatorRef, dragPreviewRef, startBlockDrag } =
    useAdvancedTextEditorBlockDrag({ editor });

  const hasVariables =
    variables.length > 0 && hasEditorExtension(editor, 'variableTag');

  const insertBlock = (content: JSONContent) =>
    insertAdvancedTextEditorBlock(
      editor,
      getAdvancedTextEditorBlockInsertionRange(editor),
      content,
    );

  const handleImageFilePicked = async (file: File | undefined) => {
    if (!isDefined(file)) {
      return;
    }

    setIsUploadingImage(true);

    try {
      const uploadedImage = await uploadEmailImage(file);

      insertBlock({
        type: TIPTAP_NODE_TYPES.IMAGE,
        attrs: {
          fileId: uploadedImage.fileId ?? null,
          src: uploadedImage.url,
        },
      });
    } catch {
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenPageStyle = () =>
    navigateSidePanelMenu({
      page: SidePanelPages.EmailPageStyle,
      pageTitle: t`Page style`,
      pageIcon: IconPaint,
      pageId: v4(),
    });

  const renderInsertionItem = ({
    id,
    title,
    icon: Icon,
    createContent,
  }: AdvancedTextEditorInsertionItem) => {
    const label = i18n._(title);
    const content = createContent((message) => i18n._(message));

    return (
      <div
        key={id}
        onPointerDown={(event: ReactPointerEvent<HTMLElement>) =>
          startBlockDrag(event, {
            Icon,
            label,
            content,
            sourceRange: null,
          })
        }
      >
        <MenuItem
          withIconContainer
          LeftIcon={Icon}
          text={label}
          onClick={() => insertBlock(content)}
        />
      </div>
    );
  };

  return (
    <SidePanelStepListContainer>
      <input
        ref={imageFileInputRef}
        type="file"
        accept={EMAIL_IMAGE_MIME_TYPES.join(',')}
        hidden
        onChange={(event) => {
          void handleImageFilePicked(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <SidePanelWorkflowSelectStepTitle>
        {t`Text`}
      </SidePanelWorkflowSelectStepTitle>
      {ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS.map(renderInsertionItem)}

      <SidePanelWorkflowSelectStepTitle>
        {t`Layout`}
      </SidePanelWorkflowSelectStepTitle>
      {LAYOUT_INSERTION_ITEMS.map(renderInsertionItem)}

      <SidePanelWorkflowSelectStepTitle>
        {t`Content`}
      </SidePanelWorkflowSelectStepTitle>
      <MenuItem
        withIconContainer
        LeftIcon={IconPhoto}
        text={isUploadingImage ? t`Uploading...` : t`Image`}
        disabled={isUploadingImage}
        onClick={() => imageFileInputRef.current?.click()}
      />
      {CONTENT_INSERTION_ITEMS.map(renderInsertionItem)}

      {hasVariables && (
        <>
          <SidePanelWorkflowSelectStepTitle>
            {t`Variables`}
          </SidePanelWorkflowSelectStepTitle>
          {variables.map(({ label, value }) => (
            <div
              key={value}
              onPointerDown={(event: ReactPointerEvent<HTMLElement>) =>
                startBlockDrag(event, {
                  Icon: IconVariable,
                  label,
                  content: {
                    type: TIPTAP_NODE_TYPES.VARIABLE_TAG,
                    attrs: { variable: value },
                  },
                  sourceRange: null,
                })
              }
            >
              <MenuItem
                withIconContainer
                LeftIcon={IconVariable}
                text={label}
                onClick={() =>
                  editor.chain().focus().insertVariableTag(value).run()
                }
              />
            </div>
          ))}
        </>
      )}

      <SidePanelWorkflowSelectStepTitle>
        {t`Page`}
      </SidePanelWorkflowSelectStepTitle>
      <MenuItem
        withIconContainer
        LeftIcon={IconPaint}
        text={t`Page style`}
        hasSubMenu
        onClick={handleOpenPageStyle}
      />

      {isDefined(draggedBlock) && (
        <AdvancedTextEditorBlockDragOverlay
          draggedBlock={draggedBlock}
          dropIndicatorRef={dropIndicatorRef}
          dragPreviewRef={dragPreviewRef}
        />
      )}
    </SidePanelStepListContainer>
  );
};
