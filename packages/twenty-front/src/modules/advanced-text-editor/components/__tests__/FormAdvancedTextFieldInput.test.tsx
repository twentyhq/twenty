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
  it('preserves rendered editor content and view attachment across fullscreen toggles', async () => {
    const user = userEvent.setup();
    const store = createStore();
    let currentEditor: Editor | null = null;
    const handleEditorReady = (editor: Editor | null) => {
      if (isDefined(editor)) {
        currentEditor = editor;
      }
    };

    render(
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

    const editor: Editor = currentEditor;

    // Type content into the editor and verify it renders in the DOM textbox
    act(() => {
      editor.commands.setContent('<p>Typed text before fullscreen</p>');
    });

    const inlineTextbox = screen.getByRole('textbox');
    expect(inlineTextbox).toBeVisible();
    expect(inlineTextbox).toHaveTextContent('Typed text before fullscreen');

    // Click the maximize button to enter fullscreen
    const maximizeButton = screen.getByRole('button');
    await user.click(maximizeButton);

    // Verify the rendered ProseMirror view in fullscreen modal remains attached, visible, and displays the content
    const fullscreenTextbox = screen.getByRole('textbox');
    expect(fullscreenTextbox).toBeVisible();
    expect(fullscreenTextbox).toHaveTextContent('Typed text before fullscreen');

    // Update content while in fullscreen and verify the rendered DOM element reflects it
    act(() => {
      editor.commands.insertContent(' and edited in fullscreen');
    });
    expect(fullscreenTextbox).toHaveTextContent(
      'Typed text before fullscreen and edited in fullscreen',
    );

    // Close fullscreen modal
    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    // Verify the rendered ProseMirror view back in the inline container is visible and displays the full text
    const returnedInlineTextbox = screen.getByRole('textbox');
    expect(returnedInlineTextbox).toBeVisible();
    expect(returnedInlineTextbox).toHaveTextContent(
      'Typed text before fullscreen and edited in fullscreen',
    );
  });
});
