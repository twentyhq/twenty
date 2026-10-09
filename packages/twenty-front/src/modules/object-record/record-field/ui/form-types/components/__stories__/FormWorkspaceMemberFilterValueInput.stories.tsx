import { FormWorkspaceMemberFilterValueInput } from '@/object-record/record-field/ui/form-types/components/FormWorkspaceMemberFilterValueInput';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { delay, graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isString } from '@sniptt/guards';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const StyledContainer = styled.div`
  width: 400px;
`;

const meta = {
  title: 'UI/Data/Field/Form/Input/FormWorkspaceMemberFilterValueInput',
  component: FormWorkspaceMemberFilterValueInput,
  decorators: [
    ObjectMetadataItemsDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  parameters: { msw: graphqlMocks },
  args: { label: 'Workspace members', onChange: fn(), defaultValue: '' },
  render: function Render(args) {
    const [value, setValue] = useState(args.defaultValue);

    return (
      <StyledContainer>
        <FormWorkspaceMemberFilterValueInput
          {...args}
          defaultValue={value}
          onChange={(nextValue) => {
            args.onChange(nextValue);
            setValue(isString(nextValue) ? nextValue : '');
          }}
        />
      </StyledContainer>
    );
  },
} satisfies Meta<typeof FormWorkspaceMemberFilterValueInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectMeAndResetSearch: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Select' }),
    );
    const dialog = await body.findByRole('dialog', {
      name: 'Select workspace members',
    });
    const dropdown = within(dialog);
    const me = await dropdown.findByRole('button', { name: 'Me' });
    await waitFor(() => expect(me).not.toBeDisabled());
    await userEvent.click(me);
    await waitFor(() => expect(me).toHaveAttribute('aria-pressed', 'true'));
    expect(args.onChange).toHaveBeenCalledWith(
      JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [],
      }),
    );
    expect(dialog).toBeVisible();
    expect(dialog.getBoundingClientRect().width).toBe(320);
    const search = dropdown.getByRole('searchbox', {
      name: 'Search workspace members',
    });
    await userEvent.type(search, 'missing-member');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Me' }));
    const reopened = within(
      await body.findByRole('dialog', { name: 'Select workspace members' }),
    );
    expect(
      reopened.getByRole('searchbox', { name: 'Search workspace members' }),
    ).toHaveValue('');
    await userEvent.keyboard('{Escape}');
  },
};

export const Variable: Story = {
  decorators: [WorkflowStepDecorator],
  args: { defaultValue: `{{${MOCKED_STEP_ID}.createdAt}}` },
  play: async ({ canvasElement }) => {
    expect(
      await within(canvasElement).findByText('Creation date'),
    ).toBeVisible();
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
    defaultValue: JSON.stringify({
      isCurrentWorkspaceMemberSelected: true,
      selectedRecordIds: [],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Me')).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Me' }),
    ).not.toBeInTheDocument();
  },
};

export const LoadingPreventsSelection: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyWorkspaceMembers', async () => {
          await delay('infinite');

          return HttpResponse.json({
            data: { workspaceMembers: { edges: [] } },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Select' }),
    );
    const dropdown = within(
      await body.findByRole('dialog', { name: 'Select workspace members' }),
    );
    await userEvent.type(
      dropdown.getByRole('searchbox', { name: 'Search workspace members' }),
      'm',
    );
    expect(await dropdown.findByText('Loading...')).toBeVisible();
    const me = dropdown.getByRole('button', { name: 'Me' });
    expect(me).toBeDisabled();
    await userEvent.click(me);
    expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
  },
};
