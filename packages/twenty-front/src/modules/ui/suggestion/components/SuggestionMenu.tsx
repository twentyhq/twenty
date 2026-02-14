import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { motion } from 'framer-motion';
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import type { SuggestionMenuProps } from '@/ui/suggestion/types/SuggestionMenuProps';

type SuggestionMenuInnerProps<TItem> = SuggestionMenuProps<TItem>;

// forwardRef does not natively support generics, so we use a helper + cast
const SuggestionMenuInner = <TItem,>(
  props: SuggestionMenuInnerProps<TItem>,
  parentRef: React.ForwardedRef<unknown>,
) => {
  const { items, onSelect, editor, range, getItemKey, renderItem, onKeyDown } =
    props;

  const [selectedIndex, setSelectedIndex] = useState(0);

  const clampedSelectedIndex =
    items.length > 0 ? Math.min(selectedIndex, items.length - 1) : 0;

  const activeItemRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const positionReference = useMemo(
    () => ({
      getBoundingClientRect: () => {
        const start = editor.view.coordsAtPos(range.from);
        return new DOMRect(start.left, start.top, 0, start.bottom - start.top);
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

  const selectItem = (index: number) => {
    const item = items[index];
    if (!item) {
      return;
    }

    onSelect(item);
  };

  useImperativeHandle(parentRef, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      const customResult = onKeyDown?.(event, clampedSelectedIndex);
      if (customResult === true) {
        return true;
      }

      const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter'];
      if (navigationKeys.includes(event.key)) {
        switch (event.key) {
          case 'ArrowUp': {
            if (!items.length) {
              return false;
            }
            let newIndex = clampedSelectedIndex - 1;
            if (newIndex < 0) {
              newIndex = items.length - 1;
            }
            setSelectedIndex(newIndex);
            return true;
          }
          case 'ArrowDown': {
            if (!items.length) {
              return false;
            }
            let newIndex = clampedSelectedIndex + 1;
            if (newIndex >= items.length) {
              newIndex = 0;
            }
            setSelectedIndex(newIndex);
            return true;
          }
          case 'Enter':
            if (!items.length) {
              return false;
            }
            selectItem(clampedSelectedIndex);
            return true;
          default:
            return false;
        }
      }

      return false;
    },
  }));

  useLayoutEffect(() => {
    const container = listContainerRef?.current;
    const activeItemContainer = activeItemRef?.current;
    if (!container || !activeItemContainer) {
      return;
    }
    const scrollableContainer =
      container.firstElementChild as HTMLElement | null;
    if (!scrollableContainer) {
      return;
    }

    const { offsetTop, offsetHeight } = activeItemContainer;

    scrollableContainer.style.transition = 'none';
    scrollableContainer.scrollTop = offsetTop - offsetHeight;
  }, [clampedSelectedIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      data-suggestion-menu
    >
      <OverlayContainer
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          zIndex: RootStackingContextZIndices.DropdownPortalAboveModal,
        }}
      >
        <DropdownContent ref={listContainerRef}>
          <DropdownMenuItemsContainer hasMaxHeight>
            {items.map((item, index) => {
              const isSelected = index === clampedSelectedIndex;

              return (
                <div
                  key={getItemKey(item)}
                  ref={isSelected ? activeItemRef : null}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                >
                  {renderItem(item, isSelected)}
                </div>
              );
            })}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      </OverlayContainer>
    </motion.div>
  );
};

export const SuggestionMenu = forwardRef(SuggestionMenuInner) as <TItem>(
  props: SuggestionMenuProps<TItem> & { ref?: React.Ref<unknown> },
) => ReturnType<typeof SuggestionMenuInner>;
