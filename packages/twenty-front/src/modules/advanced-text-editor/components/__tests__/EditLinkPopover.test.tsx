import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { EditLinkPopover } from '@/advanced-text-editor/components/EditLinkPopover';
import { type EditLinkEditor } from '@/advanced-text-editor/types/EditLinkEditor';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';

const renderWithStore = (children: ReactNode) => {
  const store = createStore();

  return {
    ...render(children, {
      wrapper: ({ children }) => (
        <I18nProvider i18n={i18n}>
          <Provider store={store}>{children}</Provider>
        </I18nProvider>
      ),
    }),
    store,
  };
};

const createEditor = () => {
  const commands: jest.Mocked<ReturnType<EditLinkEditor['chain']>> = {
    focus: jest.fn().mockImplementation(() => {
      setTimeout(
        () => screen.getByRole('textbox', { name: 'Editor' }).focus(),
        0,
      );
      return commands;
    }),
    extendMarkRange: jest.fn().mockReturnThis(),
    setLink: jest.fn().mockReturnThis(),
    unsetLink: jest.fn().mockReturnThis(),
    run: jest.fn().mockReturnValue(true),
  };

  const editor: EditLinkEditor = {
    chain: () => commands,
    get view() {
      return { dom: screen.getByRole('textbox', { name: 'Editor' }) };
    },
  };

  return { editor, commands };
};

describe('EditLinkPopover', () => {
  it('submits the link and preserves focus in the editor', async () => {
    const user = userEvent.setup();
    const { editor, commands } = createEditor();

    const { store } = renderWithStore(
      <>
        <input aria-label="Editor" />
        <EditLinkPopover
          dropdownId="edit-link-test"
          editor={editor}
          defaultValue=""
        />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Add link' }));
    expect(store.get(focusStackState.atom)).toHaveLength(1);
    expect(store.get(focusStackState.atom).at(-1)?.globalHotkeysConfig).toEqual(
      {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: false,
      },
    );
    const input = screen.getByRole('textbox', { name: 'Enter link' });
    await user.type(input, 'https://twenty.com{Enter}');

    expect(store.get(focusStackState.atom)).toEqual([]);
    expect(commands.setLink).toHaveBeenCalledWith({
      href: 'https://twenty.com',
    });
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Editor' })).toHaveFocus(),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(commands.setLink).toHaveBeenCalledTimes(1);
  });

  it('saves on blur without reopening the panel', async () => {
    const user = userEvent.setup();
    const { editor, commands } = createEditor();

    const { store } = renderWithStore(
      <>
        <input aria-label="Editor" />
        <button type="button">Outside</button>
        <EditLinkPopover
          dropdownId="edit-link-test"
          editor={editor}
          defaultValue="https://old.example"
        />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Edit link' }));
    expect(store.get(focusStackState.atom)).toHaveLength(1);
    const input = screen.getByRole('textbox', { name: 'Enter link' });
    await user.clear(input);
    await user.type(input, 'https://new.example');
    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(store.get(focusStackState.atom)).toEqual([]);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(commands.setLink).toHaveBeenCalledWith({
      href: 'https://new.example',
    });
    expect(commands.setLink).toHaveBeenCalledTimes(1);
  });

  it('returns focus to the editor when dismissed with Escape', async () => {
    const user = userEvent.setup();
    const { editor } = createEditor();

    renderWithStore(
      <>
        <input aria-label="Editor" />
        <EditLinkPopover
          dropdownId="edit-link-test"
          editor={editor}
          defaultValue="https://twenty.com"
        />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Edit link' }));
    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Editor' })).toHaveFocus(),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes an empty link and reloads the current link when reopened', async () => {
    const user = userEvent.setup();
    const { editor, commands } = createEditor();
    const { rerender, store } = renderWithStore(
      <>
        <input aria-label="Editor" />
        <EditLinkPopover
          dropdownId="edit-link-test"
          editor={editor}
          defaultValue="https://old.example"
        />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Edit link' }));
    expect(store.get(focusStackState.atom)).toHaveLength(1);
    await user.clear(screen.getByRole('textbox', { name: 'Enter link' }));
    await user.keyboard('{Enter}');
    expect(store.get(focusStackState.atom)).toEqual([]);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(commands.unsetLink).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Editor' })).toHaveFocus(),
    );

    rerender(
      <>
        <input aria-label="Editor" />
        <EditLinkPopover
          dropdownId="edit-link-test"
          editor={editor}
          defaultValue="https://new.example"
        />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Edit link' }));
    expect(store.get(focusStackState.atom)).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Enter link' })).toHaveValue(
      'https://new.example',
    );
  });
});
