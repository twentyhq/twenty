import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsDataModelFieldFormulaForm } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaForm';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockedOpportunityObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'opportunity',
  );

if (!isDefined(mockedOpportunityObjectMetadataItem)) {
  throw new Error('Opportunity object metadata item not found');
}

const meta: Meta<typeof SettingsDataModelFieldFormulaForm> = {
  title:
    'Modules/Settings/DataModel/Fields/Forms/SettingsDataModelFieldFormulaForm',
  component: SettingsDataModelFieldFormulaForm,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
  ],
  args: {
    objectMetadataItem: mockedOpportunityObjectMetadataItem,
    name: 'formula',
    ariaLabel: 'Formula',
  },
  parameters: {
    container: { width: 512 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldFormulaForm>;

const buildFormDecorator =
  (formula: string): Decorator =>
  (Story) => {
    const formConfig = useForm({ defaultValues: { formula } });

    return (
      // oxlint-disable-next-line react/jsx-props-no-spreading
      <FormProvider {...formConfig}>
        <Story />
      </FormProvider>
    );
  };

export const Empty: Story = {
  decorators: [buildFormDecorator('')],
};

export const WithLookup: Story = {
  decorators: [
    buildFormDecorator(
      'company.name || " - " || amount.amountMicros / 1000000',
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('textbox', { name: 'Formula' }),
    ).toBeVisible();
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const RejectsRelatedRecordsOutsideAnAggregate: Story = {
  decorators: [buildFormDecorator('arrayLength(noteTargets)')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('alert')).toHaveTextContent(
      '"noteTargets" has many records: read it inside count(), sum(), avg(), min() or max()',
    );
  },
};

export const AcceptsAnAggregateOfRelatedRecords: Story = {
  decorators: [buildFormDecorator('count(noteTargets)')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('textbox', { name: 'Formula' }),
    ).toBeVisible();
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
