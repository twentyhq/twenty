import { type Editor, type Range } from '@tiptap/core';
import { forwardRef, type ReactNode, useCallback } from 'react';

import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';
import { type SlashCommandPickerRef } from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandPickerComponent';

export type SlashCommandPickerProps<TItem> = {
  items: TItem[];
  onSelect: (item: TItem) => void;
  onEscape: () => void;
  editor: Editor;
  range: Range;
  getItemKey: (item: TItem) => string;
  renderItem: (item: TItem, isSelected: boolean) => ReactNode;
};

const SlashCommandPickerInner = <TItem,>(
  props: SlashCommandPickerProps<TItem>,
  ref: React.ForwardedRef<SlashCommandPickerRef>,
) => {
  const { items, onSelect, onEscape, editor, range, getItemKey, renderItem } =
    props;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return undefined;
      }

      onEscape();
      return true;
    },
    [onEscape],
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
};

export const SlashCommandPicker = forwardRef(SlashCommandPickerInner) as <
  TItem,
>(
  props: SlashCommandPickerProps<TItem> & {
    ref?: React.Ref<SlashCommandPickerRef>;
  },
) => ReturnType<typeof SlashCommandPickerInner>;
