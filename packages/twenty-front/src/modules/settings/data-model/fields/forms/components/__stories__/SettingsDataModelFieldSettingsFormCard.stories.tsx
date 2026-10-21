import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { ComponentDecorator } from 'twenty-ui/testing';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockedCompanyObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'company',
  );

if (!mockedCompanyObjectMetadataItem) {
  throw new Error('Company object metadata item not found');
}

const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
  ({ type }) => type === FieldMetadataType.TEXT,
)!;

const meta: Meta<typeof SettingsDataModelFieldSettingsFormCard> = {
  title:
    'Modules/Settings/DataModel/Fields/Forms/SettingsDataModelFieldSettingsFormCard',
  component: SettingsDataModelFieldSettingsFormCard,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    FormProviderDecorator,
  ],
  args: {
    existingFieldMetadataId: fieldMetadataItem.id,
    fieldType: FieldMetadataType.TEXT,
    objectNameSingular: mockedCompanyObjectMetadataItem.nameSingular,
  },
  parameters: {
    container: { width: 512 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldSettingsFormCard>;

export const Default: Story = {};

export const WithRelationForm: Story = {
  args: {
    existingFieldMetadataId: 'new-field',
    fieldType: FieldMetadataType.RELATION,
    objectNameSingular: 'company',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByText('Housecall Pro')).toBeVisible();
    });
  },
};

export const WithSelectForm: Story = {
  args: {
    existingFieldMetadataId: 'new-field',
    fieldType: FieldMetadataType.SELECT,
    objectNameSingular: 'company',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [optionsMenuTrigger, optionActionsTrigger] =
      await canvas.findAllByRole('button', { name: 'More options' });

    await userEvent.click(optionActionsTrigger);
    const optionActions = await body.findByRole('menu', {
      name: 'More options',
    });

    expect(
      within(optionActions).getByRole('menuitem', { name: 'Remove option' }),
    ).toBeVisible();
    await userEvent.click(
      within(optionActions).getByRole('menuitem', { name: 'Set as default' }),
    );
    await waitFor(() => expect(optionActions).not.toBeInTheDocument());

    await waitFor(() => expect(optionActionsTrigger).toBeDisabled());
    await userEvent.click(optionActionsTrigger);
    expect(body.queryByRole('menu')).not.toBeInTheDocument();

    const colorTrigger = canvas.getByRole('button', { name: 'Color' });

    await userEvent.click(colorTrigger);
    const colorPicker = await body.findByRole('dialog', { name: 'Color' });

    await userEvent.click(
      within(colorPicker).getByRole('button', { name: 'Red' }),
    );
    await waitFor(() => expect(colorPicker).not.toBeInTheDocument());
    await waitFor(() => expect(colorTrigger).toHaveFocus());
    await userEvent.click(colorTrigger);
    expect(
      await body.findByRole('button', { name: 'Red', pressed: true }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(optionsMenuTrigger);
    const optionsMenu = await body.findByRole('menu', {
      name: 'More options',
    });

    await userEvent.click(
      within(optionsMenu).getByRole('menuitem', { name: 'Bulk edit' }),
    );
    expect(
      await canvas.findByPlaceholderText('Enter one option per line'),
    ).toHaveValue('Option 1');
    await userEvent.click(optionsMenuTrigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Single edit' }),
    );
    expect(await canvas.findByDisplayValue('Option 1')).toBeVisible();

    await userEvent.click(optionsMenuTrigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Remove all' }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Color' }),
      ).not.toBeInTheDocument(),
    );
  },
};
