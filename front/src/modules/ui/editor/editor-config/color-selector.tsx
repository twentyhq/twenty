/* eslint twenty/no-hardcoded-colors: 0 */

import { Dispatch, FC, SetStateAction } from 'react';
import { keyframes, useTheme } from '@emotion/react';
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

const ButtonBase = styled.button`
  align-items: center;
  background-color: inherit;
  display: flex;
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

const ButtonIcon = styled.span<{ color: string; backgroundColor: string }>`
  align-items: center;
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  display: inline-flex;
  height: 1rem;
  justify-content: center;
  width: 1rem;
`;

const ButtonSection = styled.section`
  animation: ${fadeIn} 0.3s ease-in-out, ${slideInFromTop} 0.3s ease-in-out;
  background-color: ${(props) => props.theme.background.primary};
  border: 1px solid ${(props) => props.theme.border.color.light};
  border-radius: ${(props) => props.theme.border.radius.sm};
  box-shadow: ${(props) => props.theme.boxShadow.light};
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
  display: flex;
  font-size: 0.875rem;
  justify-content: space-between;
  padding: 0.5rem;
  &:hover {
    background-color: #f7fafc;
  }
`;

const TextLabel = styled.div`
  color: ${(props) => props.theme.font.color.tertiary};
  font-size: ${(props) => props.theme.font.size.xs};
  font-weight: ${(props) => props.theme.font.weight.medium};
  margin: 0.25rem 0.5rem;
  text-transform: uppercase;
`;

const ColorNameIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.theme.spacing(2)};
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

  const theme = useTheme();
  return (
    <>
      <ButtonBase onClick={() => setIsOpen(!isOpen)}>
        <ButtonIcon
          color={activeColorItem?.color ?? 'inherit'}
          backgroundColor={activeHighlightItem?.color ?? 'inherit'}
        >
          A
        </ButtonIcon>
        <IconChevronDown size={theme.icon.size.sm} />
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
              <ColorNameIconContainer>
                <div
                  className="rounded-sm border border-stone-200 px-1 py-px font-medium"
                  style={{ color: color ?? '' }}
                >
                  A
                </div>
                <span>{name}</span>
              </ColorNameIconContainer>
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
              <ColorNameIconContainer>
                <div
                  className="rounded-sm border border-stone-200 px-1 py-px font-medium"
                  style={{ backgroundColor: color ?? '' }}
                >
                  A
                </div>
                <span>{name}</span>
              </ColorNameIconContainer>
              {editor.isActive('highlight', { color }) && <IconCheck />}
            </ButtonContent>
          ))}
        </ButtonSection>
      )}
    </>
  );
};
