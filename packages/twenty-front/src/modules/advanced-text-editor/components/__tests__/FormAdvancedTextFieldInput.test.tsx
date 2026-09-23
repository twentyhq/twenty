import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const TEST_EDITOR_PROFILE = {
  chrome: 'field',
  minHeight: 200,
  enableFullScreen: true,
  buildExtensions: buildFullRichTextExtensions,
} satisfies AdvancedTextEditorProfile;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter>{children}</MemoryRouter>
    </JotaiProvider>
  </I18nProvider>
);

describe('FormAdvancedTextFieldInput', () => {
  it('restores the focus stack when a focused field is unmounted', () => {
    const initialFocusStack = jotaiStore.get(focusStackState.atom);
    const { unmount } = render(
      <FormAdvancedTextFieldInput
        label="Body"
        defaultValue=""
        profile={TEST_EDITOR_PROFILE}
      />,
      { wrapper: Wrapper },
    );

    act(() => screen.getByRole('textbox').focus());
    expect(jotaiStore.get(focusStackState.atom)).toHaveLength(
      initialFocusStack.length + 1,
    );

    unmount();

    expect(jotaiStore.get(focusStackState.atom)).toEqual(initialFocusStack);
  });

  it('should keep the editor working when entering full screen', async () => {
    render(
      <FormAdvancedTextFieldInput
        label="Body"
        defaultValue=""
        profile={TEST_EDITOR_PROFILE}
      />,
      { wrapper: Wrapper },
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('textbox')).toBeVisible();
  });
});
