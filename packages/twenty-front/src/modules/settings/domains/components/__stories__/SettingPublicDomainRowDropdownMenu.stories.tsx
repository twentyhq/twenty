import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toaster } from 'twenty-ui/components';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingPublicDomainRowDropdownMenu } from '@/settings/domains/components/SettingPublicDomainRowDropdownMenu';
import {
  type DeletePublicDomainMutation,
  type DeletePublicDomainMutationVariables,
  type FindManyPublicDomainsQuery,
} from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const publicDomain = {
  id: 'public-domain',
  domain: 'crm.example.com',
  createdAt: '2026-09-23T00:00:00.000Z',
  isValidated: true,
  applicationId: null,
};
const onDeletePublicDomain = fn();
const onFindManyPublicDomains = fn();
let pendingDeletion = Promise.resolve();
let completeDeletion = () => {};

const meta: Meta<typeof SettingPublicDomainRowDropdownMenu> = {
  title: 'Modules/Settings/Domains/SettingPublicDomainRowDropdownMenu',
  component: SettingPublicDomainRowDropdownMenu,
  decorators: [ComponentDecorator, ToastDecorator],
  args: { publicDomain },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    onDeletePublicDomain.mockClear();
    onFindManyPublicDomains.mockClear();
    pendingDeletion = new Promise<void>((resolve) => {
      completeDeletion = resolve;
    });
    return () => completeDeletion();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query<FindManyPublicDomainsQuery>(
          'FindManyPublicDomains',
          () => {
            onFindManyPublicDomains();
            return HttpResponse.json({
              data: { findManyPublicDomains: [publicDomain] },
            });
          },
        ),
        graphql.mutation<
          DeletePublicDomainMutation,
          DeletePublicDomainMutationVariables
        >('DeletePublicDomain', async ({ variables }) => {
          onDeletePublicDomain(variables);
          await pendingDeletion;
          return HttpResponse.json({ data: { deletePublicDomain: true } });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingPublicDomainRowDropdownMenu>;

export const DeleteAfterRequestCompletes: Story = {
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster getToastProps={() => ({ progress: 100 })} />
      </>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'More options' });

    await waitFor(() =>
      expect(onFindManyPublicDomains).toHaveBeenCalledTimes(1),
    );
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Delete' }));

    await waitFor(() =>
      expect(onDeletePublicDomain).toHaveBeenCalledWith({
        domain: publicDomain.domain,
      }),
    );
    await expect(canvas.getByRole('menu')).toBeVisible();
    await expect(onFindManyPublicDomains).toHaveBeenCalledTimes(1);

    completeDeletion();

    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(onFindManyPublicDomains).toHaveBeenCalledTimes(2),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(
      await canvas.findByText('Custom domain successfully deleted'),
    ).toBeVisible();
  },
};
