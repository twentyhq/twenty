/* eslint twenty/no-hardcoded-colors: 0 */

import { FC, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { BubbleMenu, BubbleMenuProps } from '@tiptap/react';

import {
  IconBold,
  IconCode,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
} from '@/ui/icon/index';

import { ColorSelector } from '../editor-config/color-selector';
import { LinkSelector } from '../editor-config/link-selector';
import { NodeSelector } from '../editor-config/node-selector';

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: typeof IconBold;
}

type EditorBubbleMenuProps = Omit<BubbleMenuProps, 'children'>;

const BubbleMenuStyled = styled(BubbleMenu)`
  align-items: center;
  background-color: ${(props) => props.theme.background.primary};
  border: 1px solid ${(props) => props.theme.border.color.medium};
  border-radius: ${(props) => props.theme.border.radius.sm};
  box-shadow: ${(props) => props.theme.boxShadow.light};
  display: flex;
  max-width: fit-content;

  button {
    background-color: inherit;
    border: none;
    color: ${(props) => props.theme.font.color.primary};
    padding: ${(props) => props.theme.spacing(1)};
    &:hover {
      background-color: ${(props) => props.theme.background.tertiary};
    }
    &:active {
      background-color: ${(props) => props.theme.background.secondary};
    }
  }
`;

const IconStyled = styled.span<{ isActive?: boolean }>`
  color: ${(props) => (props.isActive ? props.theme.color.blue : 'inherit')};
`;

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {
  const items: BubbleMenuItem[] = [
    {
      name: 'bold',
      isActive: () => props.editor.isActive('bold'),
      command: () => props.editor.chain().focus().toggleBold().run(),
      icon: IconBold,
    },
    {
      name: 'italic',
      isActive: () => props.editor.isActive('italic'),
      command: () => props.editor.chain().focus().toggleItalic().run(),
      icon: IconItalic,
    },
    {
      name: 'underline',
      isActive: () => props.editor.isActive('underline'),
      command: () => props.editor.chain().focus().toggleUnderline().run(),
      icon: IconUnderline,
    },
    {
      name: 'strike',
      isActive: () => props.editor.isActive('strike'),
      command: () => props.editor.chain().focus().toggleStrike().run(),
      icon: IconStrikethrough,
    },
    {
      name: 'code',
      isActive: () => props.editor.isActive('code'),
      command: () => props.editor.chain().focus().toggleCode().run(),
      icon: IconCode,
    },
  ];

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ editor }) => {
      // don't show if image is selected
      if (editor.isActive('image')) {
        return false;
      }
      return editor.view.state.selection.content().size > 0;
    },
    tippyOptions: {
      moveTransition: 'transform 0.15s ease-out',
      onHidden: () => {
        setIsNodeSelectorOpen(false);
        setIsColorSelectorOpen(false);
        setIsLinkSelectorOpen(false);
      },
    },
  };

  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
  const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);

  const theme = useTheme();

  return (
    <BubbleMenuStyled {...bubbleMenuProps}>
      <NodeSelector
        editor={props.editor}
        isOpen={isNodeSelectorOpen}
        setIsOpen={() => {
          setIsNodeSelectorOpen(!isNodeSelectorOpen);
          setIsColorSelectorOpen(false);
          setIsLinkSelectorOpen(false);
        }}
      />
      <LinkSelector
        editor={props.editor}
        isOpen={isLinkSelectorOpen}
        setIsOpen={() => {
          setIsLinkSelectorOpen(!isLinkSelectorOpen);
          setIsColorSelectorOpen(false);
          setIsNodeSelectorOpen(false);
        }}
      />
      {items.map((item, index) => (
        <button key={index} onClick={item.command}>
          <IconStyled isActive={item.isActive()}>
            <item.icon size={theme.icon.size.sm} />
          </IconStyled>
        </button>
      ))}
      <ColorSelector
        editor={props.editor}
        isOpen={isColorSelectorOpen}
        setIsOpen={() => {
          setIsColorSelectorOpen(!isColorSelectorOpen);
          setIsNodeSelectorOpen(false);
          setIsLinkSelectorOpen(false);
        }}
      />
    </BubbleMenuStyled>
  );
};
