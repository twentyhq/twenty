import { type Editor, type Range } from '@tiptap/core';
import { forwardRef, useCallback, useState } from 'react';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';

export type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  onSelect: (item: SlashCommandItem) => void;
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

    const handleKeyDown = useCallback(
      (event: KeyboardEvent, selectedIndex: number) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          editor.chain().focus().insertContentAt(range, `/${prevQuery}`).run();
          setTimeout(() => {
            setPrevSelectedIndex(prevSelectedIndex);
          }, 0);
          return true;
        }

        if (event.key === 'ArrowRight') {
          return true;
        }

        if (event.key === 'Enter' && items.length > 0) {
          setPrevQuery(query);
          setPrevSelectedIndex(selectedIndex);
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
