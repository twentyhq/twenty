import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';
import { SuggestionRow } from '@/ui/suggestion/components/SuggestionRow';
import { forwardRef, useCallback, useState } from 'react';

import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';

import { type SlashCommandMenuProps } from './types/SlashCommandMenuProps';

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
        <SuggestionRow
          selected={isSelected}
          onSelect={() => {
            onSelect(item);
          }}
          startIcon={<ListItemIcon icon={item.icon} />}
        >
          {item.title}
        </SuggestionRow>
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
