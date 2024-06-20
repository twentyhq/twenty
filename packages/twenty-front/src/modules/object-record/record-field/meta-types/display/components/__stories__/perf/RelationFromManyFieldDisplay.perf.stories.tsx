import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator } from 'twenty-ui';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RelationFromManyFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RelationFromManyFieldDisplay';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import {
  RecordFieldValueSelectorContextProvider,
  useSetRecordValue,
} from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

import {
  fieldValue,
  relationFromManyFieldDisplayMock,
} from './relationFromManyFieldDisplayMock';

const RelationFieldValueSetterEffect = () => {
  const setEntity = useSetRecoilState(
    recordStoreFamilyState(relationFromManyFieldDisplayMock.entityId),
  );

  const setRelationEntity = useSetRecoilState(
    recordStoreFamilyState(relationFromManyFieldDisplayMock.relationEntityId),
  );

  const setRecordValue = useSetRecordValue();

  useEffect(() => {
    setEntity(relationFromManyFieldDisplayMock.entityValue);
    setRelationEntity(relationFromManyFieldDisplayMock.relationFieldValue);

    setRecordValue(
      relationFromManyFieldDisplayMock.entityValue.id,
      relationFromManyFieldDisplayMock.entityValue,
    );
    setRecordValue(
      relationFromManyFieldDisplayMock.relationFieldValue.id,
      relationFromManyFieldDisplayMock.relationFieldValue,
    );
  }, [setEntity, setRelationEntity, setRecordValue]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/RelationFromManyFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    ChipGeneratorsDecorator,
    (Story) => (
      <RecordFieldValueSelectorContextProvider>
        <FieldContext.Provider
          value={{
            entityId: relationFromManyFieldDisplayMock.entityId,
            basePathToShowPage: '/object-record/',
            isLabelIdentifier: false,
            fieldDefinition: {
              ...relationFromManyFieldDisplayMock.fieldDefinition,
            } as unknown as FieldDefinition<FieldMetadata>,
            hotkeyScope: 'hotkey-scope',
          }}
        >
          <RelationFieldValueSetterEffect />
          <Story />
        </FieldContext.Provider>
      </RecordFieldValueSelectorContextProvider>
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

export const Performance = getProfilingStory({
  componentName: 'RelationFromManyFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
