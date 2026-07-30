import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useState } from 'react';
import {
  type CampaignVariableName,
  TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';
import {
  IconBox,
  IconClick,
  IconCode,
  IconColumns,
  IconH1,
  IconH2,
  IconH3,
  IconLayoutGrid,
  IconList,
  IconListNumbers,
  IconMinus,
  IconPhoto,
  IconTypography,
  IconVariable,
} from 'twenty-ui/icon';

import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { Button, LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TextInput } from '@/ui/input/components/TextInput';

const StyledRail = styled.div`
  align-items: center;
  backdrop-filter: blur(20px);
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-shadow:
    0px 2px 4px 0px ${themeCssVariables.background.transparent.light},
    0px 0px 4px 0px ${themeCssVariables.background.transparent.medium};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
`;

const StyledRailContainer = styled.div`
  left: ${themeCssVariables.spacing[3]};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
`;

const StyledPopover = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow:
    0px 2px 4px 0px ${themeCssVariables.background.transparent.light},
    0px 0px 4px 0px ${themeCssVariables.background.transparent.medium};
  left: calc(100% + ${themeCssVariables.spacing[2]});
  min-width: 180px;
  padding: ${themeCssVariables.spacing[1]};
  position: absolute;
  top: 0;
`;

const StyledImageForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]};
  width: 220px;
`;

const emailColumnJson = () => ({
  type: TIPTAP_NODE_TYPES.EMAIL_COLUMN,
  content: [{ type: TIPTAP_NODE_TYPES.PARAGRAPH }],
});

type EmailInsertRailProps = {
  editor: Editor;
};

// The floating insert rail on the left of the email canvas: text, image and
// layout blocks, mirroring the slash menu for pointer-first authoring.
export const EmailInsertRail = ({ editor }: EmailInsertRailProps) => {
  const { t } = useLingui();
  const [openMenu, setOpenMenu] = useState<
    'text' | 'image' | 'blocks' | 'variables' | null
  >(null);
  const [imageUrl, setImageUrl] = useState('');

  const hasVariables = hasEditorExtension(editor, 'variableTag');

  const variableItems: Array<{
    label: string;
    name: CampaignVariableName;
  }> = [
    { label: t`First name`, name: 'firstName' },
    { label: t`Last name`, name: 'lastName' },
    { label: t`Full name`, name: 'fullName' },
    { label: t`Email`, name: 'email' },
    { label: t`Person ID`, name: 'personId' },
  ];

  const insertVariable = (name: CampaignVariableName) => {
    editor.chain().focus().insertVariableTag(`{{${name}}}`).run();
    setOpenMenu(null);
  };

  const insertAtEnd = (content: object) => {
    editor
      .chain()
      .insertContentAt(editor.state.doc.content.size, content)
      .focus('end')
      .scrollIntoView()
      .run();
    setOpenMenu(null);
  };

  const listItemJson = () => ({
    type: TIPTAP_NODE_TYPES.LIST_ITEM,
    content: [{ type: TIPTAP_NODE_TYPES.PARAGRAPH }],
  });

  const textItems = [
    {
      Icon: IconTypography,
      label: t`Text`,
      content: { type: TIPTAP_NODE_TYPES.PARAGRAPH },
    },
    {
      Icon: IconH1,
      label: t`Title`,
      content: { type: TIPTAP_NODE_TYPES.HEADING, attrs: { level: 1 } },
    },
    {
      Icon: IconH2,
      label: t`Subtitle`,
      content: { type: TIPTAP_NODE_TYPES.HEADING, attrs: { level: 2 } },
    },
    {
      Icon: IconH3,
      label: t`Heading`,
      content: { type: TIPTAP_NODE_TYPES.HEADING, attrs: { level: 3 } },
    },
    {
      Icon: IconList,
      label: t`Bullet list`,
      content: {
        type: TIPTAP_NODE_TYPES.BULLET_LIST,
        content: [listItemJson()],
      },
    },
    {
      Icon: IconListNumbers,
      label: t`Numbered list`,
      content: {
        type: TIPTAP_NODE_TYPES.ORDERED_LIST,
        content: [listItemJson()],
      },
    },
  ];

  const handleInsertImage = () => {
    if (imageUrl.trim() === '') {
      return;
    }

    insertAtEnd({
      type: TIPTAP_NODE_TYPES.IMAGE,
      attrs: { src: imageUrl.trim() },
    });
    setImageUrl('');
  };

  const blockItems = [
    {
      Icon: IconBox,
      label: t`Section`,
      content: {
        type: TIPTAP_NODE_TYPES.EMAIL_SECTION,
        content: [{ type: TIPTAP_NODE_TYPES.PARAGRAPH }],
      },
    },
    {
      Icon: IconColumns,
      label: t`2 Columns`,
      content: {
        type: TIPTAP_NODE_TYPES.EMAIL_COLUMNS,
        content: [emailColumnJson(), emailColumnJson()],
      },
    },
    {
      Icon: IconColumns,
      label: t`3 Columns`,
      content: {
        type: TIPTAP_NODE_TYPES.EMAIL_COLUMNS,
        content: [emailColumnJson(), emailColumnJson(), emailColumnJson()],
      },
    },
    {
      Icon: IconClick,
      label: t`Button`,
      content: {
        type: TIPTAP_NODE_TYPES.EMAIL_BUTTON,
        content: [{ type: TIPTAP_NODE_TYPES.TEXT, text: t`Click here` }],
      },
    },
    {
      Icon: IconMinus,
      label: t`Divider`,
      content: { type: TIPTAP_NODE_TYPES.EMAIL_DIVIDER },
    },
    {
      Icon: IconCode,
      label: t`HTML`,
      content: { type: TIPTAP_NODE_TYPES.EMAIL_HTML },
    },
  ];

  return (
    <StyledRailContainer>
      <StyledRail>
        <LightIconButton
          Icon={IconTypography}
          size="medium"
          accent={openMenu === 'text' ? 'secondary' : 'tertiary'}
          title={t`Text`}
          onClick={() => setOpenMenu(openMenu === 'text' ? null : 'text')}
        />
        <LightIconButton
          Icon={IconPhoto}
          size="medium"
          accent={openMenu === 'image' ? 'secondary' : 'tertiary'}
          title={t`Image`}
          onClick={() => setOpenMenu(openMenu === 'image' ? null : 'image')}
        />
        <LightIconButton
          Icon={IconLayoutGrid}
          size="medium"
          accent={openMenu === 'blocks' ? 'secondary' : 'tertiary'}
          title={t`Blocks`}
          onClick={() => setOpenMenu(openMenu === 'blocks' ? null : 'blocks')}
        />
        {hasVariables && (
          <LightIconButton
            Icon={IconVariable}
            size="medium"
            accent={openMenu === 'variables' ? 'secondary' : 'tertiary'}
            title={t`Variables`}
            onClick={() =>
              setOpenMenu(openMenu === 'variables' ? null : 'variables')
            }
          />
        )}
      </StyledRail>
      {openMenu === 'variables' && (
        <StyledPopover>
          {variableItems.map(({ label, name }) => (
            <MenuItem
              key={name}
              LeftIcon={IconVariable}
              text={label}
              onClick={() => insertVariable(name)}
            />
          ))}
        </StyledPopover>
      )}
      {openMenu === 'text' && (
        <StyledPopover>
          {textItems.map(({ Icon, label, content }) => (
            <MenuItem
              key={label}
              LeftIcon={Icon}
              text={label}
              onClick={() => insertAtEnd(content)}
            />
          ))}
        </StyledPopover>
      )}
      {openMenu === 'blocks' && (
        <StyledPopover>
          {blockItems.map(({ Icon, label, content }) => (
            <MenuItem
              key={label}
              LeftIcon={Icon}
              text={label}
              onClick={() => insertAtEnd(content)}
            />
          ))}
        </StyledPopover>
      )}
      {openMenu === 'image' && (
        <StyledPopover>
          <StyledImageForm>
            <TextInput
              value={imageUrl}
              onChange={setImageUrl}
              placeholder={t`Image URL`}
              fullWidth
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleInsertImage();
                }
              }}
            />
            <Button
              title={t`Insert image`}
              size="small"
              disabled={imageUrl.trim() === ''}
              onClick={handleInsertImage}
            />
          </StyledImageForm>
        </StyledPopover>
      )}
    </StyledRailContainer>
  );
};
