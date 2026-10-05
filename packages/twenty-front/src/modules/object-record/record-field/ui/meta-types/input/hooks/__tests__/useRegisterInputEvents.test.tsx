import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { DEFAULT_GLOBAL_HOTKEYS_CONFIG } from '@/ui/utilities/hotkey/constants/DefaultGlobalHotkeysConfig';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const FIELD_INPUT_FOCUS_ID = 'field-input';

type FieldInputWithControlsProps = {
  onEnter: (inputValue: string) => void;
  onEscape: (inputValue: string) => void;
  onCopyClick: () => void;
};

const FieldInputWithControls = ({
  onEnter,
  onEscape,
  onCopyClick,
}: FieldInputWithControlsProps) => {
  const fieldInputRef = useRef<HTMLDivElement>(null);

  useRegisterInputEvents({
    focusId: FIELD_INPUT_FOCUS_ID,
    inputRef: fieldInputRef,
    inputValue: 'Acme',
    onEnter,
    onEscape,
  });

  return (
    <div ref={fieldInputRef}>
      <input aria-label="Name" defaultValue="Acme" />
      <button type="button" onClick={onCopyClick}>
        Copy
      </button>
      <div role="button" tabIndex={0}>
        Country
      </div>
      <a href="#website">Website</a>
    </div>
  );
};

const renderFieldInputWithControls = () => {
  const onEnter = jest.fn();
  const onEscape = jest.fn();
  const onCopyClick = jest.fn();
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(focusStackState.atom, [
        {
          focusId: FIELD_INPUT_FOCUS_ID,
          componentInstance: {
            componentType: FocusComponentType.OPENED_FIELD_INPUT,
            componentInstanceId: FIELD_INPUT_FOCUS_ID,
          },
          globalHotkeysConfig: DEFAULT_GLOBAL_HOTKEYS_CONFIG,
        },
      ]);
    },
  });

  render(
    <FieldInputWithControls
      onEnter={onEnter}
      onEscape={onEscape}
      onCopyClick={onCopyClick}
    />,
    { wrapper: BaseWrapper },
  );

  return { onEnter, onEscape, onCopyClick };
};

describe('useRegisterInputEvents', () => {
  it('submits with Enter from the text input', async () => {
    const user = userEvent.setup();
    const { onEnter } = renderFieldInputWithControls();

    act(() => screen.getByRole('textbox', { name: 'Name' }).focus());
    await user.keyboard('{Enter}');

    expect(onEnter).toHaveBeenCalledWith('Acme');
  });

  it('lets a native button handle Enter instead of submitting', async () => {
    const user = userEvent.setup();
    const { onEnter, onCopyClick } = renderFieldInputWithControls();

    act(() => screen.getByRole('button', { name: 'Copy' }).focus());
    await user.keyboard('{Enter}');

    expect(onCopyClick).toHaveBeenCalledTimes(1);
    expect(onEnter).not.toHaveBeenCalled();
  });

  it.each([
    [
      'a role="button" element',
      () => screen.getByRole('button', { name: 'Country' }),
    ],
    ['a link', () => screen.getByRole('link', { name: 'Website' })],
  ])('does not submit with Enter on %s', async (_, getFocusedControl) => {
    const user = userEvent.setup();
    const { onEnter } = renderFieldInputWithControls();

    act(() => getFocusedControl().focus());
    await user.keyboard('{Enter}');

    expect(onEnter).not.toHaveBeenCalled();
  });

  it('still closes with Escape on a native button', async () => {
    const user = userEvent.setup();
    const { onEscape } = renderFieldInputWithControls();

    act(() => screen.getByRole('button', { name: 'Copy' }).focus());
    await user.keyboard('{Escape}');

    expect(onEscape).toHaveBeenCalledWith('Acme');
  });
});
