import { useMultiItemDraft } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemDraft';
import { act, renderHook } from '@testing-library/react';

const getItemText = (item: string) => item;

const validateInput = (input: string) => ({
  isValid: input.includes('@'),
  errorMessage: '',
});

describe('useMultiItemDraft', () => {
  it('opens the input on mount when there is no item', () => {
    const { result } = renderHook(() =>
      useMultiItemDraft({ items: [], getItemText, onItemsChange: jest.fn() }),
    );

    expect(result.current.isInputDisplayed).toBe(true);
    expect(result.current.inputValue).toBe('');
  });

  it('opens on the first item in single item mode', () => {
    const { result } = renderHook(() =>
      useMultiItemDraft({
        items: ['a@b.c'],
        getItemText,
        onItemsChange: jest.fn(),
        maxItemCount: 1,
      }),
    );

    expect(result.current.isInputDisplayed).toBe(true);
    expect(result.current.inputValue).toBe('a@b.c');
    expect(result.current.isSingleItemMode).toBe(true);
  });

  it('appends the typed value when adding and applies it', async () => {
    const onItemsChange = jest.fn();
    const { result } = renderHook(() =>
      useMultiItemDraft({
        items: ['a@b.c'],
        getItemText,
        onItemsChange,
        validateInput,
      }),
    );

    act(() => result.current.startAdding());
    act(() => result.current.handleInputChange(' new@b.c '));

    const updatedItems = await act(async () => result.current.commitInput());

    expect(updatedItems).toEqual(['a@b.c', 'new@b.c']);
    expect(onItemsChange).toHaveBeenCalledWith(['a@b.c', 'new@b.c']);
  });

  it('removes the edited item when emptied and closes the input', async () => {
    const { result } = renderHook(() =>
      useMultiItemDraft({
        items: ['a@b.c', 'x@y.z'],
        getItemText,
        onItemsChange: jest.fn(),
      }),
    );

    act(() => result.current.startEditing(1));
    expect(result.current.inputValue).toBe('x@y.z');

    act(() => result.current.handleInputChange('   '));

    const updatedItems = await act(async () => result.current.commitInput());

    expect(updatedItems).toEqual(['a@b.c']);
    expect(result.current.isInputDisplayed).toBe(false);
  });

  it('rejects an invalid value and keeps the items', async () => {
    const onError = jest.fn();
    const onItemsChange = jest.fn();
    const { result } = renderHook(() =>
      useMultiItemDraft({
        items: ['a@b.c'],
        getItemText,
        onItemsChange,
        validateInput,
        onError,
      }),
    );

    act(() => result.current.startAdding());
    act(() => result.current.handleInputChange('not-an-email'));

    const updatedItems = await act(async () => result.current.commitInput());

    expect(updatedItems).toBeNull();
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(result.current.hasError).toBe(true);
    expect(onError).toHaveBeenLastCalledWith(true);

    act(() => result.current.handleInputChange('fixed@b.c'));

    expect(result.current.hasError).toBe(false);
    expect(onError).toHaveBeenLastCalledWith(false);
  });

  it('does not open the add input once the limit is reached', () => {
    const { result } = renderHook(() =>
      useMultiItemDraft({
        items: ['a@b.c'],
        getItemText,
        onItemsChange: jest.fn(),
        maxItemCount: 1,
      }),
    );

    act(() => result.current.closeInput());
    act(() => result.current.startAdding());

    expect(result.current.isLimitReached).toBe(true);
    expect(result.current.isInputDisplayed).toBe(false);
  });
});
