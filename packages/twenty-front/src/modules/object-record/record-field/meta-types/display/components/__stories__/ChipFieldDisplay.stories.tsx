import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { ChipFieldDisplay } from '@/object-record/record-field/meta-types/display/components/ChipFieldDisplay';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { FieldMetadataType } from '~/generated/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const ChipFieldValueSetterEffect = () => {
  const setEntityFields = useSetRecoilState(recordStoreFamilyState('123'));

  useEffect(() => {
    setEntityFields({
      id: 'henry',
      name: {
        firstName: 'Henry',
        lastName: 'Cavill',
      },
    });
  }, [setEntityFields]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/ChipFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    (Story) => (
      <FieldContext.Provider
        value={{
          entityId: '123',
          basePathToShowPage: '/object-record/',
          isLabelIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'full name',
            label: 'Henry Cavill',
            type: FieldMetadataType.FullName,
            iconName: 'IconCalendarEvent',
            metadata: {
              fieldName: 'full name',
              objectMetadataNameSingular: 'person',
            },
          },
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <ChipFieldValueSetterEffect />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: ChipFieldDisplay,
  argTypes: { value: { control: 'date' } },
  args: {},
};

export default meta;

type Story = StoryObj<typeof ChipFieldDisplay>;

export const Default: Story = {};
