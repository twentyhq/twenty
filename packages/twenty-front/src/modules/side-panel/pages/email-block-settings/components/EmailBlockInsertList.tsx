import { useLingui } from '@lingui/react/macro';
import { type Editor, type JSONContent } from '@tiptap/core';
import { useRef, useState } from 'react';
import { EMAIL_IMAGE_MIME_TYPES } from 'twenty-shared/constants';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components';
import {
  type IconComponent,
  IconPaint,
  IconPhoto,
  IconVariable,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 } from 'uuid';

import { useCampaignEmailEditorVariables } from '@/activities/emails/hooks/useCampaignEmailEditorVariables';
import { useUploadEmailImage } from '@/activities/emails/hooks/useUploadEmailImage';
import { ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockInsertionRecipes';
import { ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS } from '@/advanced-text-editor/constants/AdvancedTextEditorTextInsertionItems';
import { type AdvancedTextEditorBlockInsertionItem } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { AdvancedTextEditorDraggableContent } from '@/advanced-text-editor/components/AdvancedTextEditorDraggableContent';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelStepListContainer } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepContainer';
import { SidePanelWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepTitle';

const LAYOUT_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.SECTION,
  TIPTAP_NODE_TYPES.COLUMNS,
  TIPTAP_NODE_TYPES.DIVIDER,
];

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

  const hasVariables =
    variables.length > 0 && hasEditorExtension(editor, 'variableTag');

  const insertContent = (content: JSONContent) =>
    editor.chain().focus().insertContent(content).scrollIntoView().run();

  const handleImageFilePicked = (file: File | undefined) => {
    if (!isDefined(file)) {
      return;
    }

    setIsUploadingImage(true);
    uploadEmailImage(file)
      .then(({ fileId, url }) =>
        insertContent({
          type: TIPTAP_NODE_TYPES.IMAGE,
          attrs: { fileId: fileId ?? null, src: url },
        }),
      )
      .catch(() => undefined)
      .finally(() => setIsUploadingImage(false));
  };

  const handleOpenPageStyle = () =>
    navigateSidePanelMenu({
      page: SidePanelPages.EmailPageStyle,
      pageTitle: t`Page style`,
      pageIcon: IconPaint,
      pageId: v4(),
    });

  const renderDraggableItem = (
    key: string,
    Icon: IconComponent,
    iconColor: string,
    label: string,
    content: JSONContent,
  ) => (
    <AdvancedTextEditorDraggableContent
      key={key}
      editor={editor}
      content={content}
      Icon={Icon}
      label={label}
    >
      <MenuItem
        withIconContainer
        LeftIcon={() => <Icon color={iconColor} size={16} />}
        text={label}
        onClick={() => insertContent(content)}
      />
    </AdvancedTextEditorDraggableContent>
  );

  const renderInsertionItems = (
    items: Pick<
      AdvancedTextEditorBlockInsertionItem,
      'id' | 'title' | 'icon' | 'createContent'
    >[],
    iconColor: string,
  ) =>
    items.map(({ id, title, icon, createContent }) =>
      renderDraggableItem(
        id,
        icon,
        iconColor,
        i18n._(title),
        createContent((message) => i18n._(message)),
      ),
    );

  return (
    <SidePanelStepListContainer>
      <input
        ref={imageFileInputRef}
        type="file"
        accept={EMAIL_IMAGE_MIME_TYPES.join(',')}
        hidden
        onChange={(event) => {
          handleImageFilePicked(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <SidePanelWorkflowSelectStepTitle>
        {t`Text`}
      </SidePanelWorkflowSelectStepTitle>
      {renderInsertionItems(
        ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS,
        themeCssVariables.color.gray9,
      )}

      <SidePanelWorkflowSelectStepTitle>
        {t`Layout`}
      </SidePanelWorkflowSelectStepTitle>
      {renderInsertionItems(
        ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.filter(({ nodeType }) =>
          LAYOUT_NODE_TYPES.includes(nodeType),
        ),
        themeCssVariables.color.green9,
      )}

      <SidePanelWorkflowSelectStepTitle>
        {t`Content`}
      </SidePanelWorkflowSelectStepTitle>
      <MenuItem
        withIconContainer
        LeftIcon={() => (
          <IconPhoto color={themeCssVariables.color.orange9} size={16} />
        )}
        text={isUploadingImage ? t`Uploading...` : t`Image`}
        disabled={isUploadingImage}
        onClick={() => imageFileInputRef.current?.click()}
      />
      {renderInsertionItems(
        ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.filter(
          ({ nodeType }) => !LAYOUT_NODE_TYPES.includes(nodeType),
        ),
        themeCssVariables.color.orange9,
      )}

      {hasVariables && (
        <>
          <SidePanelWorkflowSelectStepTitle>
            {t`Variables`}
          </SidePanelWorkflowSelectStepTitle>
          {variables.map(({ label, value }) =>
            renderDraggableItem(
              value,
              IconVariable,
              themeCssVariables.color.blue9,
              label,
              {
                type: TIPTAP_NODE_TYPES.VARIABLE_TAG,
                attrs: { variable: value },
              },
            ),
          )}
        </>
      )}

      <SidePanelWorkflowSelectStepTitle>
        {t`Page`}
      </SidePanelWorkflowSelectStepTitle>
      <MenuItem
        withIconContainer
        LeftIcon={() => (
          <IconPaint color={themeCssVariables.color.purple9} size={16} />
        )}
        text={t`Page style`}
        hasSubMenu
        onClick={handleOpenPageStyle}
      />
    </SidePanelStepListContainer>
  );
};
