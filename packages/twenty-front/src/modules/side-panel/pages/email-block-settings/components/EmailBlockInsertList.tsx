import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { type Editor, type JSONContent } from '@tiptap/core';
import { useRef } from 'react';
import { EMAIL_IMAGE_MIME_TYPES } from 'twenty-shared/constants';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components/navigation';
import { type IconComponent, IconPhoto, IconVariable } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { useCampaignEmailEditorVariables } from '@/activities/emails/hooks/useCampaignEmailEditorVariables';
import { useUploadEmailImage } from '@/activities/emails/hooks/useUploadEmailImage';
import { ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockInsertionRecipes';
import { ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS } from '@/advanced-text-editor/constants/AdvancedTextEditorTextInsertionItems';
import { type AdvancedTextEditorBlockInsertionItem } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { AdvancedTextEditorDraggableContent } from '@/advanced-text-editor/components/AdvancedTextEditorDraggableContent';
import { getPositionAfterCurrentBlock } from '@/advanced-text-editor/utils/getPositionAfterCurrentBlock';
import { insertUploadingImage } from '@/advanced-text-editor/utils/insertUploadingImage';
import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

const LAYOUT_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.SECTION,
  TIPTAP_NODE_TYPES.COLUMNS,
  TIPTAP_NODE_TYPES.DIVIDER,
];

type DraggableInsertItem = {
  id: string;
  Icon: IconComponent;
  iconColor: string;
  label: string;
  content: JSONContent;
};

type EmailBlockInsertListProps = {
  editor: Editor;
};

export const EmailBlockInsertList = ({ editor }: EmailBlockInsertListProps) => {
  const { i18n, t } = useLingui();
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const { variables } = useCampaignEmailEditorVariables();
  const { uploadEmailImage } = useUploadEmailImage();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const insertContent = (content: JSONContent) => {
    editor
      .chain()
      .focus()
      .insertContentAt(getPositionAfterCurrentBlock(editor.state), content)
      .scrollIntoView()
      .run();
    closeSidePanelMenu();
  };

  const handleImageFilePicked = (file: File | undefined) => {
    if (isDefined(file)) {
      insertUploadingImage({ editor, file, onImageUpload: uploadEmailImage });
      closeSidePanelMenu();
    }
  };

  const renderDraggableItem = ({
    id,
    Icon,
    iconColor,
    label,
    content,
  }: DraggableInsertItem) => (
    <AdvancedTextEditorDraggableContent
      key={id}
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
      renderDraggableItem({
        id,
        Icon: icon,
        iconColor,
        label: i18n._(title),
        content: createContent((message) => i18n._(message)),
      }),
    );

  return (
    <StyledList>
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
      <CommandMenuItemSectionGroup heading={t`Text`}>
        {renderInsertionItems(
          ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS,
          themeCssVariables.color.gray9,
        )}
      </CommandMenuItemSectionGroup>
      <CommandMenuItemSectionGroup heading={t`Layout`}>
        {renderInsertionItems(
          ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.filter(({ nodeType }) =>
            LAYOUT_NODE_TYPES.includes(nodeType),
          ),
          themeCssVariables.color.green9,
        )}
      </CommandMenuItemSectionGroup>
      <CommandMenuItemSectionGroup heading={t`Content`}>
        <MenuItem
          withIconContainer
          LeftIcon={() => (
            <IconPhoto color={themeCssVariables.color.orange9} size={16} />
          )}
          text={t`Image`}
          onClick={() => imageFileInputRef.current?.click()}
        />
        {renderInsertionItems(
          ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.filter(
            ({ nodeType }) => !LAYOUT_NODE_TYPES.includes(nodeType),
          ),
          themeCssVariables.color.orange9,
        )}
      </CommandMenuItemSectionGroup>
      {isNonEmptyArray(variables) && (
        <CommandMenuItemSectionGroup heading={t`Variables`}>
          {variables.map(({ label, value }) =>
            renderDraggableItem({
              id: value,
              Icon: IconVariable,
              iconColor: themeCssVariables.color.blue9,
              label,
              content: {
                type: TIPTAP_NODE_TYPES.VARIABLE_TAG,
                attrs: { variable: value },
              },
            }),
          )}
        </CommandMenuItemSectionGroup>
      )}
    </StyledList>
  );
};
