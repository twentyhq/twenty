/* eslint twenty/no-hardcoded-colors: 0 */

import { Dispatch, FC, SetStateAction } from 'react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Editor } from '@tiptap/core';

import { IconCheck, IconChevronDown } from '@/ui/icon/index';

// Define your animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInFromTop = keyframes`
  from {
    transform: translateY(-20px);
  }
  to {
    transform: translateY(0);
  }
`;

// Define your styled components
const ButtonBase = styled.button`
  border-radius: 0.25rem;
  color: #4a5568;
  display: flex;
  font-size: 0.875rem;
  font-weight: 500;
  justify-content: space-between;
  padding: 0.5rem;
  text-align: left;
  &:hover {
    background-color: #f7fafc;
  }
  &:active {
    background-color: #edf2f7;
  }
`;

const ButtonIcon = styled.span`
  align-items: center;
  display: inline-flex;
  height: 1rem;
  justify-content: center;
  width: 1rem;
`;

const ButtonSection = styled.section`
  animation: ${fadeIn} 0.3s ease-in-out, ${slideInFromTop} 0.3s ease-in-out;
  background-color: white;
  border: 1px solid #edf2f7;
  border-radius: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  margin-top: 0.25rem;
  overflow: hidden;
  padding: 0.25rem;
  position: fixed;
  top: 100%;
  width: 12rem;
  z-index: 99999;
`;

const ButtonContent = styled.div`
  align-items: center;
  border-radius: 0.25rem;
  color: #4a5568;
  display: flex;
  font-size: 0.875rem;
  justify-content: space-between;
  padding: 0.5rem;
  &:hover {
    background-color: #f7fafc;
  }
`;

const IconBase = styled.span`
  align-items: center;
  color: #4a5568;
  display: inline-flex;
  height: 1rem;
  justify-content: center;
  width: 1rem;
`;

const TextLabel = styled.div`
  color: #718096;
  font-size: 0.875rem;
  margin: 0.25rem 0.5rem;
`;

export interface BubbleColorMenuItem {
  name: string;
  color: string | null;
}

interface ColorSelectorProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: 'Default',
    color: 'var(--novel-black)',
  },
  {
    name: 'Purple',
    color: '#9333EA',
  },
  {
    name: 'Red',
    color: '#E00000',
  },
  {
    name: 'Yellow',
    color: '#EAB308',
  },
  {
    name: 'Blue',
    color: '#2563EB',
  },
  {
    name: 'Green',
    color: '#008A00',
  },
  {
    name: 'Orange',
    color: '#FFA500',
  },
  {
    name: 'Pink',
    color: '#BA4081',
  },
  {
    name: 'Gray',
    color: '#A8A29E',
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: 'Default',
    color: '#ffffff;',
  },
  {
    name: 'Purple',
    color: '#f6f3f8',
  },
  {
    name: 'Red',
    color: '#fdebeb',
  },
  {
    name: 'Yellow',
    color: '#fbf4a2',
  },
  {
    name: 'Blue',
    color: '#c1ecf9',
  },
  {
    name: 'Green',
    color: '#acf79f',
  },
  {
    name: 'Orange',
    color: '#faebdd',
  },
  {
    name: 'Pink',
    color: '#faf1f5',
  },
  {
    name: 'Gray',
    color: '#f1f1ef',
  },
];

export const ColorSelector: FC<ColorSelectorProps> = ({
  editor,
  isOpen,
  setIsOpen,
}) => {
  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive('textStyle', { color }),
  );

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive('highlight', { color }),
  );

  return (
    <div className="relative h-full">
      <ButtonBase onClick={() => setIsOpen(!isOpen)}>
        <ButtonIcon>{/* Your button content here */}</ButtonIcon>
        <IconChevronDown />
      </ButtonBase>

      {isOpen && (
        <ButtonSection>
          <TextLabel>Color</TextLabel>
          {TEXT_COLORS.map(({ name, color }, index) => (
            <ButtonContent
              key={index}
              onClick={() => {
                editor.commands.unsetColor();
                name !== 'Default' &&
                  editor
                    .chain()
                    .focus()
                    .setColor(color ?? '')
                    .run();
                setIsOpen(false);
              }}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="rounded-sm border border-stone-200 px-1 py-px font-medium"
                  style={{ color: color ?? '' }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive('textStyle', { color }) && <IconCheck />}
            </ButtonContent>
          ))}

          <TextLabel>Background</TextLabel>

          {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
            <ButtonContent
              key={index}
              onClick={() => {
                editor.commands.unsetHighlight();
                name !== 'Default' &&
                  editor.commands.setHighlight({ color: color ?? '' });
                setIsOpen(false);
              }}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="rounded-sm border border-stone-200 px-1 py-px font-medium"
                  style={{ backgroundColor: color ?? '' }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive('highlight', { color }) && <IconCheck />}
            </ButtonContent>
          ))}
        </ButtonSection>
      )}
    </div>
  );
};
