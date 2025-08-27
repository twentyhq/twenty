import { SettingsMorphRelationMultiSelect } from '@/settings/components/SettingsMorphRelationMultiSelect';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type Meta, type StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const meta: Meta<typeof SettingsMorphRelationMultiSelect> = {
  title: 'Modules/Settings/SettingsMorphRelationMultiSelect',
  component: SettingsMorphRelationMultiSelect,
  decorators: [ComponentDecorator, ObjectMetadataItemsDecorator],
};
export default meta;
type Story = StoryObj<typeof SettingsMorphRelationMultiSelect>;

export const Default: Story = {
  args: {
    dropdownId: 'test-dropdown',
    disabled: false,
    selectSizeVariant: 'default',
    dropdownWidth: GenericDropdownContentWidth.Medium,
    dropdownWidthAuto: true,
    fullWidth: true,
    label: 'Select objects',
    selectedObjectMetadataIds: [
      '4a45f524-b8cb-40e8-8450-28e402b442cf',
      '6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd',
    ],
    withSearchInput: true,
    dropdownOffset: {
      x: 0,
      y: 0,
    },
    hasRightElement: false,
    onChange: fn(),
  },

  decorators: [ObjectMetadataItemsDecorator],
};
