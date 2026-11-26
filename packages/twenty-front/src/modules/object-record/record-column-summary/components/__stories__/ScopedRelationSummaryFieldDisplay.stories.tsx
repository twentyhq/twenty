import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ScopedRelationSummaryFieldDisplay } from '@/object-record/record-column-summary/components/ScopedRelationSummaryFieldDisplay';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { textfieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const RECORD_ID = 'company-id';
const RESPONSE_KEY = 'opportunities_0123456789abcdef';

const SUM_OF_AMOUNT: RecordFieldSummary = {
  aggregateOperation: AggregateOperations.SUM,
  aggregatedFieldMetadataItem: getMockFieldMetadataItemOrThrow({
    objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
    fieldName: 'amount',
  }),
  aggregateGqlFieldName: 'sumAmountAmountMicros',
};

const COUNT: RecordFieldSummary = {
  aggregateOperation: AggregateOperations.COUNT,
  aggregateGqlFieldName: 'totalCount',
};

const setCompanyAggregateValues = (aggregateValues: Record<string, unknown>) =>
  jotaiStore.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
    id: RECORD_ID,
    __typename: 'Company',
    ...aggregateValues,
  });

const meta: Meta<typeof ScopedRelationSummaryFieldDisplay> = {
  title:
    'Modules/ObjectRecord/RecordColumnSummary/ScopedRelationSummaryFieldDisplay',
  component: ScopedRelationSummaryFieldDisplay,
  decorators: [
    (Story) => (
      <FieldContext.Provider
        value={{
          recordId: RECORD_ID,
          fieldDefinition: textfieldDefinition,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: true,
        }}
      >
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  args: { responseKey: RESPONSE_KEY },
};

export default meta;

type Story = StoryObj<typeof ScopedRelationSummaryFieldDisplay>;

export const Count: Story = {
  args: { summary: COUNT },
  beforeEach: () => {
    setCompanyAggregateValues({ [`${RESPONSE_KEY}TotalCount`]: 3 });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('3')).toBeVisible();
  },
};

export const SumOfAmounts: Story = {
  args: { summary: SUM_OF_AMOUNT },
  beforeEach: () => {
    setCompanyAggregateValues({
      [`${RESPONSE_KEY}SumAmountAmountMicros`]: 1_500_000_000,
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('1.5k')).toBeVisible();
  },
};

export const NoRelatedValue: Story = {
  args: { summary: SUM_OF_AMOUNT },
  beforeEach: () => {
    setCompanyAggregateValues({
      [`${RESPONSE_KEY}SumAmountAmountMicros`]: null,
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText(/\d/)).toBeNull();
  },
};
