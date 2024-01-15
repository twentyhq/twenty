import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { withRouter } from 'storybook-addon-react-router-v6';

import { identifierMapper } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { ChipFieldDisplay } from '@/object-record/field/meta-types/display/components/ChipFieldDisplay';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { IdentifiersMapper } from '@/object-record/relation-picker/types/IdentifiersMapper';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';

const ChipFieldValueSetterEffect = ({
  value,
}: {
  value: () => IdentifiersMapper;
}) => {
  const { setIdentifiersMapper } = useRelationPicker({
    relationPickerScopeId: 'relation-picker',
  });

  useEffect(() => {
    setIdentifiersMapper(value);
    console.log('chipfieldvaluesettereffect', value);
  }, [setIdentifiersMapper, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/ChipFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
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
        <ChipFieldValueSetterEffect value={args.value} />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
    withRouter,
  ],
  component: ChipFieldDisplay,
  argTypes: { value: { control: 'date' } },
  args: {
    value: identifierMapper,
  },
};

export default meta;

type Story = StoryObj<typeof ChipFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};
