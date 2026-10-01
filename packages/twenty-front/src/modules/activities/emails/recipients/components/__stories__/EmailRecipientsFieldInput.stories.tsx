import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { StatefulEmailRecipientsFieldInput } from '@/activities/emails/recipients/components/__stories__/StatefulEmailRecipientsFieldInput';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';

const createPerson = fn();

const meta = {
  title: 'Modules/Activities/Emails/EmailRecipientsFieldInput',
  component: StatefulEmailRecipientsFieldInput,
  args: { onSubmit: fn() },
  beforeEach: async () => {
    createPerson.mockClear();
    await mockedApolloClient.clearStore();
  },
  parameters: {
    mockingDate: null,
    container: { width: 480, height: 240 },
    msw: {
      handlers: [
        graphql.mutation('CreateOnePerson', ({ variables }) => {
          createPerson(variables);

          return HttpResponse.json({
            data: {
              createPerson: {
                ...mockedPersonRecords[0],
                ...variables.input,
                emails: {
                  __typename: 'Emails',
                  ...variables.input.emails,
                },
                name: {
                  __typename: 'FullName',
                  ...variables.input.name,
                },
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    WorkspaceDecorator,
  ],
} satisfies Meta<typeof StatefulEmailRecipientsFieldInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SelectsSuggestionsFromTheInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = await canvas.findByRole('combobox', { name: 'To' });

    await userEvent.type(input, 'jeff');

    const option = await screen.findByRole('option', {
      name: /Jeffery Griffin/,
    });

    await waitFor(() => expect(option).toHaveAttribute('data-highlighted'));
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-activedescendant', option.id);

    await userEvent.click(input);

    expect(option).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');

    const secondOption = screen.getByRole('option', {
      name: /Terry Melendez/,
    });

    await waitFor(() =>
      expect(secondOption).toHaveAttribute('data-highlighted'),
    );
    expect(input).toHaveAttribute('aria-activedescendant', secondOption.id);
    await userEvent.keyboard('{Enter}');

    expect(canvas.getByText('Terry Melendez')).toBeVisible();
    expect(canvas.queryByText('Jeffery Griffin')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    await waitFor(() =>
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
    );
  },
};

export const CommitsBufferWhileSearchIsPending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = await canvas.findByRole('combobox', { name: 'To' });

    await userEvent.type(input, 'jeff');
    await screen.findByRole('option', { name: /Jeffery Griffin/ });
    await userEvent.clear(input);
    await userEvent.type(input, 'pending@example.net');
    await userEvent.keyboard('{Enter}');

    expect(canvas.getByText('pending@example.net')).toBeVisible();
    expect(canvas.queryByText('Jeffery Griffin')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
  },
};

export const PreservesComposerShortcuts: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = await canvas.findByRole('combobox', { name: 'To' });

    await userEvent.click(input);
    await userEvent.keyboard('{Control>}{Enter}{/Control}');

    expect(args.onSubmit).toHaveBeenCalledTimes(1);

    await userEvent.type(input, 'buffer@example.net');
    await screen.findByRole('option', { name: /buffer@example.net/ });
    await userEvent.keyboard('{Meta>}{Enter}{/Meta}');

    expect(canvas.getByText('buffer@example.net')).toBeVisible();
    expect(args.onSubmit).toHaveBeenCalledTimes(1);
    expect(input).toHaveFocus();

    await userEvent.keyboard('{Meta>}{Enter}{/Meta}');

    expect(args.onSubmit).toHaveBeenCalledTimes(2);
  },
};

export const PastesAndSelectsChipsWithTheKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = await canvas.findByRole('combobox', { name: 'To' });
    const ccInput = canvas.getByRole('combobox', { name: 'Cc' });

    await userEvent.click(input);
    await userEvent.paste('Ada <ada@example.net>; Grace <grace@example.net>');

    expect(canvas.getByText('Ada')).toBeVisible();
    expect(canvas.getByText('Grace')).toBeVisible();

    await userEvent.keyboard('{ArrowLeft}{Enter}');

    expect(input).toHaveValue('Grace <grace@example.net>');
    await userEvent.keyboard('{Escape}');

    expect(canvas.getByText('Grace')).toBeVisible();
    expect(input).toHaveValue('');

    await userEvent.type(input, 'jeff');
    await screen.findByRole('option', { name: /Jeffery Griffin/ });
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    expect(input).toHaveValue('jeff');
    expect(input).toHaveFocus();

    await userEvent.clear(input);
    await userEvent.keyboard(
      '{ArrowLeft}{Shift>}{ArrowLeft}{/Shift}{Backspace}',
    );

    expect(canvas.queryByText('Ada')).not.toBeInTheDocument();
    expect(canvas.queryByText('Grace')).not.toBeInTheDocument();

    await userEvent.type(input, 'blur@example.net');
    await userEvent.click(ccInput);

    expect(canvas.getByText('blur@example.net')).toBeVisible();
  },
};

export const ChipMenusReturnFocusToTheInput: Story = {
  args: {
    initialRecipients: [{ address: 'ada@example.net', displayName: 'Ada' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = await canvas.findByRole('combobox', { name: 'To' });

    await userEvent.type(input, 'jeff');
    await screen.findByRole('option', { name: /Jeffery Griffin/ });
    await userEvent.click(canvas.getByText('Ada'));

    expect(
      await screen.findByRole('menuitem', { name: 'Add as person' }),
    ).toBeVisible();
    expect(input).toHaveFocus();
    expect(input).toHaveValue('jeff');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'Remove' })).toBeVisible();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Copy email' }));
    await waitFor(() => expect(input).toHaveFocus());

    await userEvent.click(canvas.getByText('Ada'));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Edit' }),
    );

    expect(input).toHaveValue('Ada <ada@example.net>');
    expect(input).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await userEvent.dblClick(canvas.getByText('Ada'));

    expect(input).toHaveValue('Ada <ada@example.net>');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByText('Ada'));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Remove' }),
    );

    expect(canvas.queryByText('Ada')).not.toBeInTheDocument();
    await waitFor(() => expect(input).toHaveFocus());
  },
};

export const ModifiedClicksSelectInsteadOfOpeningMenus: Story = {
  args: {
    initialRecipients: [
      { address: 'ada@example.net', displayName: 'Ada' },
      { address: 'grace@example.net', displayName: 'Grace' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = await canvas.findByRole('combobox', { name: 'To' });
    const user = userEvent.setup();

    await user.click(input);
    await user.keyboard('{Meta>}');
    await user.click(canvas.getByText('Ada'));
    await user.keyboard('{/Meta}{Shift>}');
    await user.click(canvas.getByText('Grace'));
    await user.keyboard('{/Shift}');

    expect(canvas.getByText('Ada').closest('[data-selected]')).toHaveAttribute(
      'data-selected',
      'true',
    );
    expect(
      canvas.getByText('Grace').closest('[data-selected]'),
    ).toHaveAttribute('data-selected', 'true');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
    await user.keyboard('{Backspace}');

    expect(canvas.queryByText('Ada')).not.toBeInTheDocument();
    expect(canvas.queryByText('Grace')).not.toBeInTheDocument();
  },
};

export const AddsRecipientAsPerson: Story = {
  args: {
    initialRecipients: [{ address: 'ada@example.net', displayName: 'Ada' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = await canvas.findByRole('combobox', { name: 'To' });

    await userEvent.click(canvas.getByText('Ada'));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Add as person' }),
    );

    await waitFor(() => expect(createPerson).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await waitFor(() => expect(input).toHaveFocus());
  },
};

export const DragsRecipientsBetweenFields: Story = {
  args: {
    initialRecipients: [{ address: 'ada@example.net', displayName: 'Ada' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup();
    const source = await canvas.findByText('Ada');
    const destination = canvas.getByRole('combobox', { name: 'Cc' });
    const destinationDropTarget = destination.closest('[data-drop-target]');

    await waitFor(() =>
      expect(
        source.closest('[aria-roledescription="draggable"]'),
      ).toHaveAttribute('aria-grabbed', 'false'),
    );
    const sourceBounds = source.getBoundingClientRect();
    const destinationBounds = destination.getBoundingClientRect();
    const sourceCoordinates = {
      clientX: sourceBounds.x + sourceBounds.width / 2,
      clientY: sourceBounds.y + sourceBounds.height / 2,
    };
    const destinationCoordinates = {
      clientX: destinationBounds.x + destinationBounds.width / 2,
      clientY: destinationBounds.y + destinationBounds.height / 2,
    };

    await user.pointer([
      { target: source, keys: '[MouseLeft>]', coords: sourceCoordinates },
      {
        target: source,
        coords: {
          ...sourceCoordinates,
          clientX: sourceCoordinates.clientX + 12,
        },
      },
    ]);

    await screen.findByText(/Picked up draggable item to:ada@example.net/);
    await user.pointer({
      target: destination,
      coords: {
        ...destinationCoordinates,
        clientX: destinationCoordinates.clientX - 1,
      },
    });
    await screen.findByText(/was moved over droppable target/);
    await user.pointer({ target: destination, coords: destinationCoordinates });
    await waitFor(() =>
      expect(destinationDropTarget).toHaveAttribute('data-drop-target', 'true'),
    );
    await user.pointer({
      target: destination,
      keys: '[/MouseLeft]',
      coords: destinationCoordinates,
    });

    await waitFor(() =>
      expect(
        within(canvas.getByRole('group', { name: 'cc recipients' })).getByText(
          'Ada',
        ),
      ).toBeVisible(),
    );
    expect(
      within(canvas.getByRole('group', { name: 'to recipients' })).queryByText(
        'Ada',
      ),
    ).not.toBeInTheDocument();
  },
};
