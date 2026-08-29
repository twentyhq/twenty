import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Editor } from '@tiptap/core';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';

const createProfile = (
  overrides: Partial<AdvancedTextEditorProfile> = {},
): AdvancedTextEditorProfile => ({
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: true,
  buildExtensions: () => [],
  ...overrides,
});

describe('FormAdvancedTextFieldInput', () => {
  it('preserves editor instance and typed content across fullscreen toggles', async () => {
    const user = userEvent.setup();
    const store = createStore();
    let currentEditor: Editor | null = null;
    const handleEditorReady = (editor: Editor | null) => {
      if (isDefined(editor)) {
        currentEditor = editor;
      }
    };

    const { getByRole } = render(
      <I18nProvider i18n={i18n}>
        <JotaiProvider store={store}>
          <MemoryRouter
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}
          >
            <FormAdvancedTextFieldInput
              defaultValue=""
              profile={createProfile()}
              enableFullScreen={true}
              onEditorReady={handleEditorReady}
            />
          </MemoryRouter>
        </JotaiProvider>
      </I18nProvider>,
    );

    if (!isDefined(currentEditor)) {
      throw new Error('Editor was not initialized');
    }

    const initialEditorInstance: Editor = currentEditor;

    act(() => {
      initialEditorInstance.commands.setContent(
        '<p>Typed text before fullscreen</p>',
      );
    });

    expect(initialEditorInstance.getText()).toBe(
      'Typed text before fullscreen',
    );

    // Click the maximize button to enter fullscreen
    const maximizeButton = getByRole('button');
    await user.click(maximizeButton);

    // Verify editor instance is retained and content is preserved in fullscreen
    expect(currentEditor).toBe(initialEditorInstance);
    expect(initialEditorInstance.getText()).toBe(
      'Typed text before fullscreen',
    );

    // Type additional content while in fullscreen
    act(() => {
      initialEditorInstance.commands.setContent(
        '<p>Typed text before fullscreen and edited in fullscreen</p>',
      );
    });

    // Close fullscreen
    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    // Verify editor instance and updated content remain preserved after exiting fullscreen
    expect(currentEditor).toBe(initialEditorInstance);
    expect(initialEditorInstance.getText()).toBe(
      'Typed text before fullscreen and edited in fullscreen',
    );
  });
});
