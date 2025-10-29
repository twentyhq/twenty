import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/SlashMenuDropdownClickOutsideId';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { ThemeProvider } from '@emotion/react';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { type FC } from 'react';
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

  return (
    <>
      {createPortal(
        <ThemeProvider theme={theme}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            <OverlayContainer
              ref={refs.setFloating}
              style={floatingStyles}
              data-click-outside-id={SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
            >
              <DropdownContent>
                <DropdownMenuItemsContainer hasMaxHeight>
                  {items.map((item, index) => {
                    const isSelected = index === selectedIndex;

                    return (
                      <MenuItemSuggestion
                        key={item.id}
                        LeftIcon={item.icon}
                        text={item.title}
                        selected={isSelected}
                        onClick={() => onSelect(item)}
                      />
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
