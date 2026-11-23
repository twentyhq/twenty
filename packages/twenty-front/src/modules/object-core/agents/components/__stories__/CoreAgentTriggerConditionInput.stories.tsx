import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from 'twenty-ui/testing';

import { CoreAgentTriggerConditionInput } from '@/object-core/agents/components/CoreAgentTriggerConditionInput';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const CONDITION_STATES = [
  {
    name: 'Editable',
    props: {
      isReadOnly: false,
      condition: "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'",
    },
  },
  {
    name: 'Editable, invalid',
    props: { isReadOnly: false, condition: 'company.unknownField > 100' },
  },
  {
    name: 'Read-only',
    props: { isReadOnly: true, condition: 'company.employees > 100' },
  },
  { name: 'Read-only, empty', props: { isReadOnly: true, condition: '' } },
];

const meta: Meta<typeof CoreAgentTriggerConditionInput> = {
  title: 'Modules/ObjectCore/Agents/CoreAgentTriggerConditionInput',
  component: CoreAgentTriggerConditionInput,
  decorators: [ComponentDecorator, ObjectMetadataItemsDecorator],
  args: {
    objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
    condition: '',
    isReadOnly: false,
    onConditionChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof CoreAgentTriggerConditionInput>;

export const Catalog: CatalogStory<
  Story,
  typeof CoreAgentTriggerConditionInput
> = {
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: CONDITION_STATES.map(({ name }) => name),
          props: (stateName: string) =>
            CONDITION_STATES.find(({ name }) => name === stateName)?.props ??
            {},
        },
      ],
      options: { elementContainer: { width: 360 } },
    },
  },
  decorators: [CatalogDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findAllByText('Condition (Optional)')).toHaveLength(3);
  },
};
