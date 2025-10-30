import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { ThemeProvider } from '@emotion/react';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { type FC, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { MenuItemSuggestion } from 'twenty-ui/navigation';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';

type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  selectedIndex: number;
  onSelect: (item: SlashCommandItem) => void;
  clientRect: DOMRect | null;
};

export const SlashCommandMenu: FC<SlashCommandMenuProps> = ({
  items,
  selectedIndex,
  onSelect,
  clientRect,
}) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(4), flip()],
    whileElementsMounted: autoUpdate,
    elements: {
      reference: clientRect
        ? {
            getBoundingClientRect: () => clientRect,
          }
        : null,
    },
  });

  const colorScheme = document.documentElement.className.includes('dark')
    ? 'Dark'
    : 'Light';
  const theme = colorScheme === 'Dark' ? THEME_DARK : THEME_LIGHT;

  useLayoutEffect(() => {
    if (!refs.floating.current) {
      return;
    }

    const floatingElement = refs.floating.current;
    const selectedItem = floatingElement.querySelector(
      `[data-slash-menu-item-index="${selectedIndex}"]`,
    ) as HTMLElement | null;

    if (selectedItem !== null) {
      selectedItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex, refs]);

  return (
    <>
      {createPortal(
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
              <DropdownContent>
                <DropdownMenuItemsContainer hasMaxHeight>
                  {items.map((item, index) => {
                    const isSelected = index === selectedIndex;

                    return (
                      <div key={item.id} data-slash-menu-item-index={index}>
                        <MenuItemSuggestion
                          LeftIcon={item.icon}
                          text={item.title}
                          selected={isSelected}
                          onClick={() => onSelect(item)}
                        />
                      </div>
                    );
                  })}
                </DropdownMenuItemsContainer>
              </DropdownContent>
            </OverlayContainer>
          </motion.div>
        </ThemeProvider>,
        document.body,
      )}
    </>
  );
};

export default SlashCommandMenu;
