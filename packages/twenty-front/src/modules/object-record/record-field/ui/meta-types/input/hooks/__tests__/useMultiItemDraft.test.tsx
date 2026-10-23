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
      useMultiItemDraft({ items: [], getItemText }),
    );

    expect(result.current.isInputDisplayed).toBe(true);
    expect(result.current.inputValue).toBe('');
  });

  it('opens on the first item in single item mode', () => {
    const { result } = renderHook(() =>
      useMultiItemDraft({ items: ['a@b.c'], getItemText, maxItemCount: 1 }),
    );

    expect(result.current.isInputDisplayed).toBe(true);
    expect(result.current.inputValue).toBe('a@b.c');
    expect(result.current.isSingleItemMode).toBe(true);
  });

  it('appends the typed value when adding', async () => {
    const { result } = renderHook(() =>
      useMultiItemDraft({ items: ['a@b.c'], getItemText, validateInput }),
    );

    act(() => result.current.startAdding());
    act(() => result.current.handleInputChange(' new@b.c '));

    const outcome = await act(async () =>
      result.current.computeItemsFromInput(),
    );

    expect(outcome).toEqual({
      isValid: true,
      updatedItems: ['a@b.c', 'new@b.c'],
    });
  });

  it('replaces the edited item and clears it when emptied', async () => {
    const { result } = renderHook(() =>
      useMultiItemDraft({ items: ['a@b.c', 'x@y.z'], getItemText }),
    );

    act(() => result.current.startEditing(1));
    expect(result.current.inputValue).toBe('x@y.z');

    act(() => result.current.handleInputChange('   '));

    const outcome = await act(async () =>
      result.current.computeItemsFromInput(),
    );

    expect(outcome).toEqual({ isValid: true, updatedItems: ['a@b.c'] });
    expect(result.current.isInputDisplayed).toBe(false);
  });

  it('flags an invalid value and keeps the items', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useMultiItemDraft({
        items: ['a@b.c'],
        getItemText,
        validateInput,
        onError,
      }),
    );

    act(() => result.current.startAdding());
    act(() => result.current.handleInputChange('not-an-email'));

    const outcome = await act(async () =>
      result.current.computeItemsFromInput(),
    );

    expect(outcome).toEqual({ isValid: false, updatedItems: ['a@b.c'] });
    expect(result.current.hasError).toBe(true);
    expect(onError).toHaveBeenLastCalledWith(true);

    act(() => result.current.handleInputChange('fixed@b.c'));

    expect(result.current.hasError).toBe(false);
    expect(onError).toHaveBeenLastCalledWith(false);
  });

  it('does not open the add input once the limit is reached', () => {
    const { result } = renderHook(() =>
      useMultiItemDraft({ items: ['a@b.c'], getItemText, maxItemCount: 1 }),
    );

    act(() => result.current.closeInput());
    act(() => result.current.startAdding());

    expect(result.current.isLimitReached).toBe(true);
    expect(result.current.isInputDisplayed).toBe(false);
  });
});
