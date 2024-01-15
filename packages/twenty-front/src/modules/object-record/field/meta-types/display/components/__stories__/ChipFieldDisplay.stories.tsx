import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { withRouter } from 'storybook-addon-react-router-v6';

import { identifierMapper } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { ChipFieldDisplay } from '@/object-record/field/meta-types/display/components/ChipFieldDisplay';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';

const ChipFieldValueSetterEffect = () => {
  const { setIdentifiersMapper } = useRelationPicker({
    relationPickerScopeId: 'relation-picker',
  });

  const setEntityFields = useSetRecoilState(entityFieldsFamilyState('123'));

  useEffect(() => {
    setIdentifiersMapper(() => identifierMapper);
    setEntityFields({
      name: {
        firstName: 'Henry',
        lastName: 'Cavill',
      },
    });
  }, [setEntityFields, setIdentifiersMapper]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/ChipFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '123',
          basePathToShowPage: '/object-record/',
          isLabelIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'full name',
            label: 'Henry Cavill',
            type: 'FULL_NAME',
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
    withRouter,
  ],
  component: ChipFieldDisplay,
  argTypes: { value: { control: 'date' } },
  args: {},
};

export default meta;

type Story = StoryObj<typeof ChipFieldDisplay>;

export const Default: Story = {};
