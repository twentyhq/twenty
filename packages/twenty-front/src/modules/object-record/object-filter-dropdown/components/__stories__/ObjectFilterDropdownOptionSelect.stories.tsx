import { Meta, StoryObj } from '@storybook/react';

import { ObjectFilterDropdownOptionSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOptionSelect';
import { ComponentDecorator } from 'twenty-ui';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof ObjectFilterDropdownOptionSelect> = {
  title:
    'Modules/ObjectRecord/ObjectFilterDropdown/ObjectFilterDropdownOptionSelect',
  component: ObjectFilterDropdownOptionSelect,
  decorators: [
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
  ],
};

export default meta;

export const Default: StoryObj<typeof ObjectFilterDropdownOptionSelect> = {
  render: ObjectFilterDropdownOptionSelect,
};
