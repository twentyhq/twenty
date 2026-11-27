import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toaster } from 'twenty-ui/components/feedback';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingPublicDomainRowDropdownMenu } from '@/settings/domains/components/SettingPublicDomainRowDropdownMenu';
import {
  type DeletePublicDomainMutation,
  type DeletePublicDomainMutationVariables,
  type FindManyPublicDomainsQuery,
  type SetApplicationPrimaryPublicDomainMutation,
  type SetApplicationPrimaryPublicDomainMutationVariables,
} from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const publicDomain = {
  __typename: 'PublicDomain' as const,
  id: 'public-domain',
  domain: 'crm.example.com',
  createdAt: '2026-09-23T00:00:00.000Z',
  isValidated: true,
  applicationId: null,
};
const DELETE_FAILURE_MESSAGE = 'Domain deletion failed';
const onDeletePublicDomain = fn();
const onSetApplicationPrimaryPublicDomain = fn();
const onFindManyPublicDomains = fn();
let pendingDeletion = Promise.resolve();
let completeDeletion = () => {};

const findManyPublicDomainsHandler = graphql.query<FindManyPublicDomainsQuery>(
  'FindManyPublicDomains',
  () => {
    onFindManyPublicDomains();
    return HttpResponse.json({
      data: { findManyPublicDomains: [publicDomain] },
    });
  },
);

const meta: Meta<typeof SettingPublicDomainRowDropdownMenu> = {
  title: 'Modules/Settings/Domains/SettingPublicDomainRowDropdownMenu',
  component: SettingPublicDomainRowDropdownMenu,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster getToastProps={() => ({ progress: 100 })} />
      </>
    ),
    ComponentDecorator,
    ToastDecorator,
  ],
  args: { publicDomain, applicationId: 'application-id', isPrimary: false },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    onDeletePublicDomain.mockClear();
    onSetApplicationPrimaryPublicDomain.mockClear();
    onFindManyPublicDomains.mockClear();
    pendingDeletion = new Promise<void>((resolve) => {
      completeDeletion = resolve;
    });
    return () => completeDeletion();
  },
  parameters: {
    msw: {
      handlers: [
        findManyPublicDomainsHandler,
        graphql.mutation<
          DeletePublicDomainMutation,
          DeletePublicDomainMutationVariables
        >('DeletePublicDomain', async ({ variables }) => {
          onDeletePublicDomain(variables);
          await pendingDeletion;
          return HttpResponse.json({ data: { deletePublicDomain: true } });
        }),
        graphql.mutation<
          SetApplicationPrimaryPublicDomainMutation,
          SetApplicationPrimaryPublicDomainMutationVariables
        >('SetApplicationPrimaryPublicDomain', ({ variables }) => {
          onSetApplicationPrimaryPublicDomain(variables);
          return HttpResponse.json({
            data: {
              setApplicationPrimaryPublicDomain: {
                __typename: 'PublicDomain',
                id: publicDomain.id,
                domain: publicDomain.domain,
              },
            },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingPublicDomainRowDropdownMenu>;

export const DeleteClosesMenuAndRefetches: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'More options' });

    await waitFor(() =>
      expect(onFindManyPublicDomains).toHaveBeenCalledTimes(1),
    );
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Delete' }));

    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(onDeletePublicDomain).toHaveBeenCalledWith({
        domain: publicDomain.domain,
      }),
    );
    await expect(onFindManyPublicDomains).toHaveBeenCalledTimes(1);

    completeDeletion();

    await waitFor(() =>
      expect(onFindManyPublicDomains).toHaveBeenCalledTimes(2),
    );
    await expect(
      await canvas.findByText('Custom domain successfully deleted'),
    ).toBeVisible();
    await expect(onDeletePublicDomain).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DeleteFailureShowsOneError: Story = {
  parameters: {
    msw: {
      handlers: [
        findManyPublicDomainsHandler,
        graphql.mutation<
          DeletePublicDomainMutation,
          DeletePublicDomainMutationVariables
        >('DeletePublicDomain', ({ variables }) => {
          onDeletePublicDomain(variables);
          return HttpResponse.json({
            errors: [
              {
                message: DELETE_FAILURE_MESSAGE,
                extensions: { userFriendlyMessage: DELETE_FAILURE_MESSAGE },
              },
            ],
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await waitFor(() =>
      expect(onFindManyPublicDomains).toHaveBeenCalledTimes(1),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Delete' }));

    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(await canvas.findByText(DELETE_FAILURE_MESSAGE)).toBeVisible();
    await expect(canvas.getAllByText(DELETE_FAILURE_MESSAGE)).toHaveLength(1);
    await expect(onDeletePublicDomain).toHaveBeenCalledTimes(1);
    await expect(onFindManyPublicDomains).toHaveBeenCalledTimes(1);
  },
};

export const SetAsPrimary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(
      canvas.getByRole('menuitem', { name: 'Set as primary' }),
    );

    await waitFor(() =>
      expect(onSetApplicationPrimaryPublicDomain).toHaveBeenCalledWith({
        applicationId: 'application-id',
        publicDomainId: publicDomain.id,
      }),
    );
    await expect(
      await canvas.findByText('Primary domain updated'),
    ).toBeVisible();
  },
};

export const PrimaryDomainHasNoSetAsPrimaryItem: Story = {
  args: { isPrimary: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));

    await expect(
      await canvas.findByRole('menuitem', { name: 'Delete' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('menuitem', { name: 'Set as primary' }),
    ).not.toBeInTheDocument();
  },
};
