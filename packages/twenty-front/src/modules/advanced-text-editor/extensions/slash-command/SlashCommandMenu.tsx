import { type Editor, type Range } from '@tiptap/core';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';

export type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  onSelect: (item: SlashCommandItem) => void;
  clientRect: (() => DOMRect | null) | null;
  editor: Editor;
  range: Range;
  query: string;
};

const getItemKey = (item: SlashCommandItem) => item.id;

export const SlashCommandMenu = forwardRef<unknown, SlashCommandMenuProps>(
  (props, ref) => {
    const { items, onSelect, editor, range, query } = props;

    const [prevSelectedIndex, setPrevSelectedIndex] = useState(0);
    const [prevQuery, setPrevQuery] = useState('');

    // Track selectedIndex for ArrowLeft restoration via a ref
    // populated by onKeyDown callbacks from the generic menu
    const selectedIndexRef = useRef(0);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          editor.chain().focus().insertContentAt(range, `/${prevQuery}`).run();
          setTimeout(() => {
            // Restore previous index -- handled via the ref
            selectedIndexRef.current = prevSelectedIndex;
          }, 0);
          return true;
        }

        if (event.key === 'ArrowRight') {
          return true;
        }

        if (event.key === 'Enter' && items.length > 0) {
          setPrevQuery(query);
          setPrevSelectedIndex(selectedIndexRef.current);
        }

        return undefined;
      },
      [editor, range, prevQuery, prevSelectedIndex, items.length, query],
    );

    const renderItem = useCallback(
      (item: SlashCommandItem, isSelected: boolean) => (
        <MenuItemSuggestion
          LeftIcon={item.icon}
          text={item.title}
          selected={isSelected}
          onClick={() => {
            onSelect(item);
          }}
        />
      ),
      [onSelect],
    );

    return (
      <SuggestionMenu
        ref={ref}
        items={items}
        onSelect={onSelect}
        editor={editor}
        range={range}
        getItemKey={getItemKey}
        renderItem={renderItem}
        onKeyDown={handleKeyDown}
      />
    );
  },
);
