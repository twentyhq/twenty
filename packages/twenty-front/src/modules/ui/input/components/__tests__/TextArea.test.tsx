import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { TextArea } from '@/ui/input/components/TextArea';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

describe('TextArea', () => {
  it('calls onFocus after pushing the text area to the focus stack', () => {
    const store = createStore();
    const onFocus = jest.fn();
    const textAreaId = 'test-text-area-id';

    render(
      <JotaiProvider store={store}>
        <TextArea textAreaId={textAreaId} value="" onFocus={onFocus} />
      </JotaiProvider>,
    );

    fireEvent.focus(screen.getByRole('textbox'));

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(store.get(focusStackState.atom).at(-1)).toMatchObject({
      focusId: textAreaId,
      componentInstance: {
        componentType: FocusComponentType.TEXT_AREA,
        componentInstanceId: textAreaId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  });
});
