import { ThemeProvider } from '@emotion/react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { type Editor, type Range } from '@tiptap/core';
import { motion } from 'framer-motion';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MenuItemSuggestion } from 'twenty-ui/navigation';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';

import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';

export type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  onSelect: (item: SlashCommandItem) => void;
  clientRect: (() => DOMRect | null) | null;
  editor: Editor;
  range: Range;
  query: string;
};

export const SlashCommandMenu = forwardRef<unknown, SlashCommandMenuProps>(
  (props, parentRef) => {
    const { items, onSelect, editor, range, query } = props;

    const colorScheme = document.documentElement.className.includes('dark')
      ? 'Dark'
      : 'Light';
    const theme = colorScheme === 'Dark' ? THEME_DARK : THEME_LIGHT;

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [prevSelectedIndex, setPrevSelectedIndex] = useState(0);
    const [prevQuery, setPrevQuery] = useState('');

    const activeCommandRef = useRef<HTMLDivElement>(null);
    const commandListContainerRef = useRef<HTMLDivElement>(null);

    const positionReference = useMemo(
      () => ({
        getBoundingClientRect: () => {
          const start = editor.view.coordsAtPos(range.from);
          return new DOMRect(
            start.left,
            start.top,
            0,
            start.bottom - start.top,
          );
        },
      }),
      [editor, range],
    );

    const { refs, floatingStyles } = useFloating({
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [offset(4), flip(), shift()],
      whileElementsMounted: (reference, floating, update) => {
        return autoUpdate(reference, floating, update, {
          animationFrame: true,
        });
      },
      elements: {
        reference: positionReference,
      },
    });

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (!item) {
          return;
        }

        onSelect(item);
      },
      [onSelect, items],
    );

    useImperativeHandle(parentRef, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        const navigationKeys = [
          'ArrowUp',
          'ArrowDown',
          'Enter',
          'ArrowLeft',
          'ArrowRight',
        ];
        if (navigationKeys.includes(event.key)) {
          let newCommandIndex = selectedIndex;

          switch (event.key) {
            case 'ArrowLeft':
              event.preventDefault();

              editor
                .chain()
                .focus()
                .insertContentAt(range, `/${prevQuery}`)
                .run();
              setTimeout(() => {
                setSelectedIndex(prevSelectedIndex);
              }, 0);
              return true;
            case 'ArrowUp':
              if (!items.length) {
                return false;
              }
              newCommandIndex = selectedIndex - 1;
              if (newCommandIndex < 0) {
                newCommandIndex = items.length - 1;
              }
              setSelectedIndex(newCommandIndex);
              return true;
            case 'ArrowDown':
              if (!items.length) {
                return false;
              }
              newCommandIndex = selectedIndex + 1;
              if (newCommandIndex >= items.length) {
                newCommandIndex = 0;
              }
              setSelectedIndex(newCommandIndex);
              return true;
            case 'Enter':
              if (!items.length) {
                return false;
              }
              selectItem(selectedIndex);

              setPrevQuery(query);
              setPrevSelectedIndex(selectedIndex);
              return true;
            default:
              return false;
          }
        }
      },
    }));

    useLayoutEffect(() => {
      const container = commandListContainerRef?.current;
      const activeCommandContainer = activeCommandRef?.current;
      if (!container || !activeCommandContainer) {
        return;
      }
      const scrollableContainer =
        container.firstElementChild as HTMLElement | null;
      if (!scrollableContainer) {
        return;
      }

      const { offsetTop, offsetHeight } = activeCommandContainer;

      scrollableContainer.style.transition = 'none';
      scrollableContainer.scrollTop = offsetTop - offsetHeight;
    }, [selectedIndex]);

    return (
      <ThemeProvider theme={theme}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          data-slash-command-menu
        >
          <OverlayContainer
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              zIndex: RootStackingContextZIndices.DropdownPortalAboveModal,
            }}
          >
            <DropdownContent ref={commandListContainerRef}>
              <DropdownMenuItemsContainer hasMaxHeight>
                {items.map((item, index) => {
                  const isSelected = index === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      ref={isSelected ? activeCommandRef : null}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <MenuItemSuggestion
                        LeftIcon={item.icon}
                        text={item.title}
                        selected={isSelected}
                        onClick={() => {
                          onSelect(item);
                        }}
                      />
                    </div>
                  );
                })}
              </DropdownMenuItemsContainer>
            </DropdownContent>
          </OverlayContainer>
        </motion.div>
      </ThemeProvider>
    );
  },
);
