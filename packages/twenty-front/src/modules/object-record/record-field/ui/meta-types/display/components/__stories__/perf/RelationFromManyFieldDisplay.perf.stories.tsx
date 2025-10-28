import { type Meta, type StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RelationFromManyFieldDisplay';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  fieldValue,
  relationFromManyFieldDisplayMock,
} from './relationFromManyFieldDisplayMock';

const RelationFieldValueSetterEffect = () => {
  const setEntity = useSetRecoilState(
    recordStoreFamilyState(relationFromManyFieldDisplayMock.entityValue.id),
  );

  useEffect(() => {
    setEntity({
      __typename: relationFromManyFieldDisplayMock.entityValue.__typename,
      id: relationFromManyFieldDisplayMock.entityValue.id,
      company: [relationFromManyFieldDisplayMock.entityValue],
    } satisfies ObjectRecord);
  }, [setEntity]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/RelationFromManyFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    ChipGeneratorsDecorator,
    (Story) => (
      <FieldContext.Provider
        value={{
          recordId: relationFromManyFieldDisplayMock.recordId,
          isLabelIdentifier: false,
          fieldDefinition: {
            ...relationFromManyFieldDisplayMock.fieldDefinition,
          } as unknown as FieldDefinition<FieldMetadata>,
          isRecordFieldReadOnly: false,
        }}
      >
        <RelationFieldValueSetterEffect />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: RelationFromManyFieldDisplay,
  argTypes: { value: { control: 'date' } },
  args: { fieldValue: fieldValue },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof RelationFromManyFieldDisplay>;

export const Default: Story = {};

// TODO: optimize this component once we have morph many
export const Performance = getProfilingStory({
  componentName: 'RelationFromManyFieldDisplay',
  averageThresholdInMs: 1,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
