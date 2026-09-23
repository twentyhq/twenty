import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { type ComponentProps, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { FormRichTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRichTextFieldInput';
import { stubProseMirrorLayout } from '~/testing/utils/stubProseMirrorLayout';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <Provider>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  </I18nProvider>
);

const renderRichTextInput = (
  props: Partial<ComponentProps<typeof FormRichTextFieldInput>>,
) =>
  render(
    <FormRichTextFieldInput
      label="Body"
      defaultValue={undefined}
      onChange={jest.fn()}
      {...props}
    />,
    { wrapper: Wrapper },
  );

const typeInEditor = async (keys: string) => {
  await userEvent.click(screen.getByRole('textbox'));
  await userEvent.keyboard(keys);
};

const lastSavedBlocks = (onChange: jest.Mock) =>
  JSON.parse(onChange.mock.calls.at(-1)?.[0].blocknote);

beforeAll(stubProseMirrorLayout);

it('saves record text as BlockNote and reopens it', async () => {
  const onChange = jest.fn();
  const { unmount } = renderRichTextInput({ onChange });

  await typeInEditor('Hello');

  expect(lastSavedBlocks(onChange)).toEqual([
    {
      type: 'paragraph',
      props: {},
      content: [{ type: 'text', text: 'Hello', styles: {} }],
      children: [],
    },
  ]);

  unmount();
  renderRichTextInput({ defaultValue: onChange.mock.calls.at(-1)?.[0] });

  expect(screen.getByRole('textbox')).toHaveTextContent('Hello');
});

it('leaves Mod+Enter to forms that submit on it', async () => {
  const onChange = jest.fn();
  const onFormKeyDown = jest.fn();
  render(
    <div onKeyDown={onFormKeyDown}>
      <FormRichTextFieldInput
        label="Body"
        defaultValue={undefined}
        onChange={onChange}
        formSubmitsOnModEnter
      />
    </div>,
    { wrapper: Wrapper },
  );

  await typeInEditor('Hello{Control>}{Enter}{/Control}');

  expect(onFormKeyDown).toHaveBeenCalledWith(
    expect.objectContaining({ key: 'Enter', ctrlKey: true }),
  );
  expect(lastSavedBlocks(onChange)[0].content).toEqual([
    { type: 'text', text: 'Hello', styles: {} },
  ]);
});

it('inserts a line break on Mod+Enter in other forms', async () => {
  const onChange = jest.fn();
  renderRichTextInput({ onChange });

  await typeInEditor('Hello{Control>}{Enter}{/Control}World');

  expect(lastSavedBlocks(onChange)[0].content).toEqual([
    { type: 'text', text: 'Hello', styles: {} },
    { type: 'text', text: '\n', styles: {} },
    { type: 'text', text: 'World', styles: {} },
  ]);
});

it('protects unsupported stored blocks from being overwritten', () => {
  const onChange = jest.fn();
  renderRichTextInput({
    onChange,
    defaultValue: {
      blocknote: JSON.stringify([{ type: 'table', props: {}, content: [] }]),
      markdown: null,
    },
  });

  expect(
    screen.getByText("This content uses formatting that can't be edited here"),
  ).toBeVisible();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it('renders stored BlockNote formatting and lists in the editor', () => {
  renderRichTextInput({
    defaultValue: {
      blocknote: JSON.stringify([
        {
          type: 'heading',
          props: { level: 2 },
          content: [{ type: 'text', text: 'Heading', styles: { bold: true } }],
        },
        {
          type: 'bulletListItem',
          props: {},
          content: [{ type: 'text', text: 'First item', styles: {} }],
        },
        {
          type: 'bulletListItem',
          props: {},
          content: [
            {
              type: 'link',
              href: 'https://example.com',
              content: [{ type: 'text', text: 'Second item', styles: {} }],
            },
          ],
        },
      ]),
      markdown: null,
    },
  });

  expect(
    screen.getByRole('heading', { name: 'Heading', level: 2 }),
  ).toContainHTML('<strong>Heading</strong>');
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getByRole('link', { name: 'Second item' })).toHaveAttribute(
    'href',
    'https://example.com',
  );
});
