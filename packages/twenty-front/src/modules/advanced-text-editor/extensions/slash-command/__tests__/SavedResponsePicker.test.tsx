import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { SavedResponsePicker } from '@/advanced-text-editor/extensions/slash-command/SavedResponsePicker';
import { useSavedResponseDataSource } from '@/advanced-text-editor/extensions/slash-command/data-sources/SavedResponseDataSource';

jest.mock(
  '@/advanced-text-editor/extensions/slash-command/data-sources/SavedResponseDataSource',
);

const mockedUseSavedResponseDataSource = jest.mocked(
  useSavedResponseDataSource,
);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

describe('SavedResponsePicker', () => {
  let editor: Editor;

  beforeEach(() => {
    i18n.load('en', {});
    i18n.activate('en');
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

  it('should show a loading state', () => {
    mockedUseSavedResponseDataSource.mockReturnValue({
      getSavedResponses: () => [],
      loading: true,
    });

    render(
      <SavedResponsePicker
        editor={editor}
        range={{ from: 1, to: 7 }}
        onComplete={jest.fn()}
        searchQuery=""
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Loading saved responses…')).toBeInTheDocument();
  });

  it('should show an empty state', () => {
    mockedUseSavedResponseDataSource.mockReturnValue({
      getSavedResponses: () => [],
      loading: false,
    });

    render(
      <SavedResponsePicker
        editor={editor}
        range={{ from: 1, to: 7 }}
        onComplete={jest.fn()}
        searchQuery=""
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('No Saved Responses yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Create one in your workspace settings to use it here/),
    ).toBeInTheDocument();
  });

  it('should insert only the selected response body', async () => {
    const onComplete = jest.fn();
    mockedUseSavedResponseDataSource.mockReturnValue({
      getSavedResponses: () => [
        {
          id: 'response-id',
          name: 'Marketplace Invite',
          subject: 'An invitation',
          body: 'Please join our marketplace.',
          category: 'Marketplace',
        },
      ],
      loading: false,
    });

    render(
      <SavedResponsePicker
        editor={editor}
        range={{ from: 1, to: 7 }}
        onComplete={onComplete}
        searchQuery=""
      />,
      { wrapper: Wrapper },
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Marketplace Invite/ }),
    );

    expect(editor.getText()).toBe('Please join our marketplace.');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should populate an empty email subject', async () => {
    const setSubject = jest.fn();
    mockedUseSavedResponseDataSource.mockReturnValue({
      getSavedResponses: () => [
        {
          id: 'response-id',
          name: 'Marketplace Invite',
          subject: 'An invitation',
          body: 'Please join our marketplace.',
          category: 'Marketplace',
        },
      ],
      loading: false,
    });

    render(
      <SavedResponsePicker
        editor={editor}
        range={{ from: 1, to: 7 }}
        onComplete={jest.fn()}
        searchQuery=""
        savedResponseSubject={{
          getCurrentSubject: () => '',
          setSubject,
        }}
      />,
      { wrapper: Wrapper },
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Marketplace Invite/ }),
    );

    expect(setSubject).toHaveBeenCalledWith('An invitation');
  });

  it('should not overwrite an existing email subject', async () => {
    const setSubject = jest.fn();
    mockedUseSavedResponseDataSource.mockReturnValue({
      getSavedResponses: () => [
        {
          id: 'response-id',
          name: 'Marketplace Invite',
          subject: 'An invitation',
          body: 'Please join our marketplace.',
          category: 'Marketplace',
        },
      ],
      loading: false,
    });

    render(
      <SavedResponsePicker
        editor={editor}
        range={{ from: 1, to: 7 }}
        onComplete={jest.fn()}
        searchQuery=""
        savedResponseSubject={{
          getCurrentSubject: () => 'Existing subject',
          setSubject,
        }}
      />,
      { wrapper: Wrapper },
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Marketplace Invite/ }),
    );

    expect(setSubject).not.toHaveBeenCalled();
  });

  it('should filter responses by category', () => {
    mockedUseSavedResponseDataSource.mockReturnValue({
      getSavedResponses: () => [
        {
          id: 'marketplace-id',
          name: 'Invitation',
          subject: null,
          body: 'Marketplace body',
          category: 'Marketplace',
        },
        {
          id: 'finance-id',
          name: 'Instructions',
          subject: null,
          body: 'Finance body',
          category: 'Finance',
        },
      ],
      loading: false,
    });

    render(
      <SavedResponsePicker
        editor={editor}
        range={{ from: 1, to: 7 }}
        onComplete={jest.fn()}
        searchQuery="market"
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Invitation')).toBeInTheDocument();
    expect(screen.queryByText('Instructions')).not.toBeInTheDocument();
  });
});
