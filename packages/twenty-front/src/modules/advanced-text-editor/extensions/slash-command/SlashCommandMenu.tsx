import { type Editor, type Range } from '@tiptap/core';
import { forwardRef, useCallback, useState } from 'react';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { type SlashCommandPickerRef } from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandPickerComponent';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';

export type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  onSelect: (item: SlashCommandItem) => void;
  editor: Editor;
  range: Range;
  query: string;
  savedResponseSubject?: {
    getCurrentSubject: () => string;
    setSubject: (subject: string) => void;
  };
};

const getItemKey = (item: SlashCommandItem) => item.id;

export const SlashCommandMenu = forwardRef<
  SlashCommandPickerRef,
  SlashCommandMenuProps
>((props, ref) => {
  const { items, onSelect, editor, range, query, savedResponseSubject } = props;

  const [prevSelectedIndex, setPrevSelectedIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState('');
  const [activePickerItem, setActivePickerItem] = useState<SlashCommandItem>();

  const handleSelect = useCallback(
    (item: SlashCommandItem) => {
      if (item.PickerComponent) {
        setActivePickerItem(item);
        return;
      }

      onSelect(item);
    },
    [onSelect],
  );

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
          handleSelect(item);
        }}
      />
    ),
    [handleSelect],
  );

  const inlinePickerItem = items.find(
    (item) => item.PickerComponent && item.pickerQuery,
  );
  const refreshedActivePickerItem = activePickerItem
    ? (items.find((item) => item.id === activePickerItem.id) ??
      activePickerItem)
    : undefined;
  const currentPickerItem = refreshedActivePickerItem ?? inlinePickerItem;

  if (currentPickerItem?.PickerComponent) {
    const PickerComponent = currentPickerItem.PickerComponent;

    return (
      <PickerComponent
        ref={ref}
        editor={editor}
        range={range}
        searchQuery={currentPickerItem.pickerQuery ?? ''}
        savedResponseSubject={savedResponseSubject}
        onComplete={() => {
          onSelect(currentPickerItem);
        }}
      />
    );
  }

  return (
    <SuggestionMenu
      ref={ref}
      items={items}
      onSelect={handleSelect}
      editor={editor}
      range={range}
      getItemKey={getItemKey}
      renderItem={renderItem}
      onKeyDown={handleKeyDown}
    />
  );
});
