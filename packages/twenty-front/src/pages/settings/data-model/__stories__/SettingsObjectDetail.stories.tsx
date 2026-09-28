import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { sleep } from '~/utils/sleep';

const updateOneFieldMetadataItem = fn();

import { SettingsObjectDetailPage } from '~/pages/settings/data-model/SettingsObjectDetailPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsObjectDetail',
  component: SettingsObjectDetailPage,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural',
    routeParams: { ':objectNamePlural': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectDetailPage>;

export const StandardObject: Story = {
  play: async () => {
    await sleep(100);
  },
};

export const CustomObject: Story = {
  args: {
    routeParams: { ':objectNamePlural': 'myCustoms' },
  },
};

export const ObjectTabs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fieldsTab = await canvas.findByTestId('tab-fields');
    const settingsTab = await canvas.findByTestId('tab-settings');

    await expect(fieldsTab).toBeVisible();
    await expect(settingsTab).toBeVisible();
  },
};

export const SettingsTabDropdowns: Story = {
  beforeEach: () => {
    updateOneFieldMetadataItem.mockClear();
    jotaiStore.set(isAdvancedModeEnabledState.atom, true);
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED,
          value: true,
        },
      ],
    });

    return () => jotaiStore.set(isAdvancedModeEnabledState.atom, false);
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

    await userEvent.click(await canvas.findByTestId('tab-settings'));

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

    const filterButton = canvas.getByRole('button', { name: 'Filter' });

    expect(canvas.getByText('Account Owner')).toBeVisible();
    await userEvent.click(filterButton);
    const filterPanel = await body.findByRole('dialog', { name: 'Filter' });
    const hideSystemIndexes = within(filterPanel).getByRole('switch', {
      name: 'Hide system indexes',
    });

    await userEvent.click(hideSystemIndexes);
    expect(hideSystemIndexes).toBeChecked();
    expect(filterPanel).toBeVisible();
    await waitFor(() =>
      expect(canvas.queryByText('Account Owner')).not.toBeInTheDocument(),
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(filterPanel).not.toBeInTheDocument());
    await waitFor(() => expect(filterButton).toHaveFocus());
  },
};
