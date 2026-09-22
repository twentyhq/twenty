import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { FormRichTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRichTextFieldInput';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <Provider>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  </I18nProvider>
);

it('edits record text without a variable picker and reopens the saved BlockNote content', async () => {
  const onChange = jest.fn();
  const { unmount } = render(
    <FormRichTextFieldInput
      label="Body"
      defaultValue={undefined}
      onChange={onChange}
    />,
    { wrapper: Wrapper },
  );
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => screen.getByRole('textbox'),
  });
  Object.defineProperty(Range.prototype, 'getClientRects', {
    configurable: true,
    value: () => [],
  });
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(),
  });
  await userEvent.click(screen.getByRole('textbox'));
  await userEvent.keyboard('Hello');
  expect(onChange).toHaveBeenLastCalledWith({
    blocknote: expect.stringContaining('"styles"'),
    markdown: null,
  });
  const savedValue = onChange.mock.calls.at(-1)?.[0];
  unmount();
  render(
    <FormRichTextFieldInput
      label="Body"
      defaultValue={savedValue}
      onChange={jest.fn()}
    />,
    { wrapper: Wrapper },
  );
  expect(screen.getByRole('textbox')).toHaveTextContent('Hello');
});

it('protects unsupported stored blocks from being overwritten', () => {
  const onChange = jest.fn();
  render(
    <FormRichTextFieldInput
      label="Body"
      defaultValue={{
        blocknote: JSON.stringify([{ type: 'table', props: {}, content: [] }]),
        markdown: null,
      }}
      onChange={onChange}
    />,
    { wrapper: Wrapper },
  );
  expect(
    screen.getByText("This content uses formatting that can't be edited here"),
  ).toBeVisible();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it('renders legacy formatting and list structure in the shared editor', () => {
  render(
    <FormRichTextFieldInput
      defaultValue={{
        blocknote: JSON.stringify([
          {
            type: 'heading',
            props: { level: 2 },
            content: [
              { type: 'text', text: 'Heading', styles: { bold: true } },
            ],
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
      }}
      onChange={jest.fn()}
    />,
    { wrapper: Wrapper },
  );
  expect(
    screen.getByRole('heading', { name: 'Heading', level: 2 }),
  ).toContainHTML('<strong>Heading</strong>');
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getByRole('link', { name: 'Second item' })).toHaveAttribute(
    'href',
    'https://example.com',
  );
});
