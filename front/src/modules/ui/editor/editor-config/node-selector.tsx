/* eslint twenty/no-hardcoded-colors: 0 */

import { Dispatch, FC, SetStateAction } from 'react';
import styled from '@emotion/styled';
import { Editor } from '@tiptap/core';

import {
  IconAlignLeft,
  IconCheck,
  IconChevronDown,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconSquareCheck,
} from '@/ui/icon/index';

import { BubbleMenuItem } from '../components/EditorBubbleMenu';

interface NodeSelectorProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const StyledDiv = styled.div`
  height: 100%;
  position: relative;
`;

const StyledButton = styled.button`
  display: flex;
  height: 100%;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568; // replace with actual color
  &:hover {
    background-color: #f7fafc; // replace with actual color
  }
  &:active {
    background-color: #edf2f7; // replace with actual color
  }
`;

const StyledSection = styled.section`
  position: fixed;
  top: 100%;
  z-index: 99999;
  margin-top: 0.25rem;
  display: flex;
  width: 12rem;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0.25rem;
  border: 1px solid #edf2f7; // replace with actual color
  background-color: #ffffff;
  padding: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  // Add your animations here
`;

const StyledItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.125rem;
  padding: 0.5rem 0.25rem;
  font-size: 0.875rem;
  color: #4a5568; // replace with actual color
  &:hover {
    background-color: #f7fafc; // replace with actual color
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 0.5rem;
`;

const StyledIconBorder = styled.div`
  border-radius: 0.125rem;
  border: 1px solid #edf2f7; // replace with actual color
  padding: 0.25rem;
`;

export const NodeSelector: FC<NodeSelectorProps> = ({
  editor,
  isOpen,
  setIsOpen,
}) => {
  const items: BubbleMenuItem[] = [
    {
      name: 'Text',
      icon: IconAlignLeft,
      command: () =>
        editor.chain().focus().toggleNode('paragraph', 'paragraph').run(),
      // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
      isActive: () =>
        editor.isActive('paragraph') &&
        !editor.isActive('bulletList') &&
        !editor.isActive('orderedList'),
    },
    {
      name: 'Heading 1',
      icon: IconH1,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      name: 'Heading 2',
      icon: IconH2,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      name: 'Heading 3',
      icon: IconH3,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      name: 'To-do List',
      icon: IconSquareCheck,
      command: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive('taskItem'),
    },
    {
      name: 'Bullet List',
      icon: IconList,
      command: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      name: 'Numbered List',
      icon: IconListNumbers,
      command: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      name: 'Quote',
      icon: IconQuote,
      command: () =>
        editor
          .chain()
          .focus()
          .toggleNode('paragraph', 'paragraph')
          .toggleBlockquote()
          .run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      name: 'Code',
      icon: IconCode,
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
  ];

  const activeItem = items.filter((item) => item.isActive()).pop() ?? {
    name: 'Multiple',
  };
  return (
    <StyledDiv>
      <StyledButton onClick={() => setIsOpen(!isOpen)}>
        <span>{activeItem?.name}</span>
        <IconChevronDown />
      </StyledButton>

      {isOpen && (
        <StyledSection>
          {items.map((item, index) => (
            <StyledItemButton
              key={index}
              onClick={() => {
                item.command();
                setIsOpen(false);
              }}
            >
              <StyledIconContainer>
                <StyledIconBorder>
                  <item.icon />
                </StyledIconBorder>
                <span>{item.name}</span>
              </StyledIconContainer>
              {activeItem.name === item.name && <IconCheck />}
            </StyledItemButton>
          ))}
        </StyledSection>
      )}
    </StyledDiv>
  );
};
