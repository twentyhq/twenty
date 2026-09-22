import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Editor } from '@tiptap/core';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';

import { EditLinkPopover } from '@/advanced-text-editor/components/EditLinkPopover';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <Provider>{children}</Provider>
  </I18nProvider>
);

const createEditor = () => {
  const commands = {
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
    run: jest.fn(),
  };

  const editor = {
    chain: () => commands,
    get view() {
      return { dom: screen.getByRole('textbox', { name: 'Editor' }) };
    },
  } as unknown as Editor;

  return { editor, commands };
};

describe('EditLinkPopover', () => {
  it('submits the link and preserves focus in the editor', async () => {
    const user = userEvent.setup();
    const { editor, commands } = createEditor();

    render(
      <>
        <input aria-label="Editor" />
        <EditLinkPopover editor={editor} defaultValue="" />
      </>,
      { wrapper: Wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Add link' }));
    const input = screen.getByRole('textbox', { name: 'Enter link' });
    await user.type(input, 'https://twenty.com{Enter}');

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

    render(
      <>
        <input aria-label="Editor" />
        <button type="button">Outside</button>
        <EditLinkPopover editor={editor} defaultValue="https://old.example" />
      </>,
      { wrapper: Wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Edit link' }));
    const input = screen.getByRole('textbox', { name: 'Enter link' });
    await user.clear(input);
    await user.type(input, 'https://new.example');
    await user.click(screen.getByRole('button', { name: 'Outside' }));

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

    render(
      <>
        <input aria-label="Editor" />
        <EditLinkPopover editor={editor} defaultValue="https://twenty.com" />
      </>,
      { wrapper: Wrapper },
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
    const { rerender } = render(
      <>
        <input aria-label="Editor" />
        <EditLinkPopover editor={editor} defaultValue="https://old.example" />
      </>,
      { wrapper: Wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Edit link' }));
    await user.clear(screen.getByRole('textbox', { name: 'Enter link' }));
    await user.keyboard('{Enter}');
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
        <EditLinkPopover editor={editor} defaultValue="https://new.example" />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Edit link' }));
    expect(screen.getByRole('textbox', { name: 'Enter link' })).toHaveValue(
      'https://new.example',
    );
  });
});
