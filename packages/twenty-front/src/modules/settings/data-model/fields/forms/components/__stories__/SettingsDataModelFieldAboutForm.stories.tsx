import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { mockedPersonObjectMetadataItem } from '~/testing/mock-data/metadata';

import { SettingsDataModelFieldAboutForm } from '../SettingsDataModelFieldAboutForm';

const StyledContainer = styled.div`
  flex: 1;
`;

const meta: Meta<typeof SettingsDataModelFieldAboutForm> = {
  title: 'Modules/Settings/DataModel/SettingsDataModelFieldAboutForm',
  component: SettingsDataModelFieldAboutForm,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    FormProviderDecorator,
    IconsProviderDecorator,
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldAboutForm>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem.fields.find(
      ({ name }) => name === 'name',
    )!,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
