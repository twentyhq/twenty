import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsObjectSearch } from '~/pages/settings/data-model/SettingsObjectSearch';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const updateOneFieldMetadataItem = fn();

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsObjectSearch',
  component: SettingsObjectSearch,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural/object-search',
    routeParams: { ':objectNamePlural': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectSearch>;

export const AddSearchField: Story = {
  beforeEach: () => {
    updateOneFieldMetadataItem.mockClear();
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED,
          value: true,
        },
      ],
    });
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.mutation(
          'UpdateOneFieldMetadataItem',
          ({ variables }) => {
            updateOneFieldMetadataItem(variables);

            return HttpResponse.json({ data: { updateOneField: null } });
          },
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const addField = await canvas.findByRole('button', { name: 'Add field' });

    await userEvent.click(addField);
    const addFieldMenu = await body.findByRole('menu', { name: 'Add field' });

    await waitFor(() =>
      expect(
        within(addFieldMenu).getByRole('menuitem', { name: 'Domain Name' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}');
    expect(
      within(addFieldMenu).getByRole('menuitem', { name: 'Address' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(addFieldMenu).not.toBeInTheDocument());
    await waitFor(() =>
      expect(updateOneFieldMetadataItem).toHaveBeenCalledWith(
        expect.objectContaining({ updatePayload: { isSearchable: true } }),
      ),
    );
  },
};
