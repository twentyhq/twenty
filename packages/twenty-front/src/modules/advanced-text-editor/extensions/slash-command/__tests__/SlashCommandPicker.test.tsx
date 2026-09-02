import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

import { SlashCommandPicker } from '@/advanced-text-editor/extensions/slash-command/SlashCommandPicker';
import { type SlashCommandPickerRef } from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandPickerComponent';

const PICKER_ITEMS = [
  { code: 101, label: 'First arbitrary item' },
  { code: 202, label: 'Second arbitrary item' },
  { code: 303, label: 'Third arbitrary item' },
];

const getItemKey = (item: (typeof PICKER_ITEMS)[number]) =>
  item.code.toString();

const renderItem = (
  item: (typeof PICKER_ITEMS)[number],
  isSelected: boolean,
) => (
  <MenuItemSuggestion
    text={item.label}
    selected={isSelected}
    onClick={() => undefined}
  />
);

describe('SlashCommandPicker', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>/saved</p>',
    });
    jest.spyOn(editor.view, 'coordsAtPos').mockReturnValue({
      left: 0,
      right: 0,
      top: 0,
      bottom: 20,
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('should select responses with the keyboard', () => {
    const onSelect = jest.fn();
    const pickerRef = createRef<SlashCommandPickerRef>();

    render(
      <SlashCommandPicker
        ref={pickerRef}
        items={PICKER_ITEMS}
        onSelect={onSelect}
        onEscape={jest.fn()}
        editor={editor}
        range={{ from: 1, to: 7 }}
        getItemKey={getItemKey}
        renderItem={renderItem}
      />,
    );

    act(() => {
      pickerRef.current?.onKeyDown({
        event: new KeyboardEvent('keydown', { key: 'ArrowDown' }),
      });
    });
    act(() => {
      pickerRef.current?.onKeyDown({
        event: new KeyboardEvent('keydown', { key: 'Enter' }),
      });
    });

    expect(onSelect).toHaveBeenCalledWith(PICKER_ITEMS[1]);
  });

  it('should select a response with the mouse', async () => {
    const onSelect = jest.fn();

    render(
      <SlashCommandPicker
        items={PICKER_ITEMS}
        onSelect={onSelect}
        onEscape={jest.fn()}
        editor={editor}
        range={{ from: 1, to: 7 }}
        getItemKey={getItemKey}
        renderItem={(item, isSelected) => (
          <MenuItemSuggestion
            text={item.label}
            selected={isSelected}
            onClick={() => onSelect(item)}
          />
        )}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Third arbitrary item' }),
    );

    expect(onSelect).toHaveBeenCalledWith(PICKER_ITEMS[2]);
  });

  it('should close on Escape', () => {
    const onEscape = jest.fn();
    const pickerRef = createRef<SlashCommandPickerRef>();

    render(
      <SlashCommandPicker
        ref={pickerRef}
        items={PICKER_ITEMS}
        onSelect={jest.fn()}
        onEscape={onEscape}
        editor={editor}
        range={{ from: 1, to: 7 }}
        getItemKey={getItemKey}
        renderItem={renderItem}
      />,
    );

    act(() => {
      pickerRef.current?.onKeyDown({
        event: new KeyboardEvent('keydown', { key: 'Escape' }),
      });
    });

    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
