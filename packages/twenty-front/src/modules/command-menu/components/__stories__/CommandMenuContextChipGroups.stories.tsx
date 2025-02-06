import { Meta, StoryObj } from '@storybook/react';

import styled from '@emotion/styled';
import {
  ComponentDecorator,
  IconBuildingSkyscraper,
  IconSearch,
  IconSettingsAutomation,
  IconUser,
} from 'twenty-ui';
import { CommandMenuContextChipGroups } from '../CommandMenuContextChipGroups';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const meta: Meta<typeof CommandMenuContextChipGroups> = {
  title: 'Modules/CommandMenu/CommandMenuContextChipGroups',
  component: CommandMenuContextChipGroups,
  decorators: [
    (Story) => <StyledContainer>{Story()}</StyledContainer>,
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof CommandMenuContextChipGroups>;

export const Default: Story = {
  args: {
    contextChips: [
      {
        Icons: [<IconBuildingSkyscraper size={16} />],
        text: 'Company',
      },
      {
        Icons: [<IconUser size={16} />],
        text: 'Person',
      },
    ],
  },
};

export const SingleChip: Story = {
  args: {
    contextChips: [
      {
        Icons: [<IconUser size={16} />],
        text: 'Person',
      },
    ],
  },
};

export const ThreeChipsWithIcons: Story = {
  args: {
    contextChips: [
      {
        Icons: [<IconBuildingSkyscraper size={16} />],
        text: 'Company',
      },
      {
        Icons: [<IconUser size={16} />],
        text: 'Person',
      },
      {
        Icons: [<IconSettingsAutomation size={16} />],
        text: 'Settings',
      },
    ],
  },
};

export const FourChipsWithIcons: Story = {
  args: {
    contextChips: [
      {
        Icons: [<IconBuildingSkyscraper size={16} />],
        text: 'Company',
      },
      {
        Icons: [<IconUser size={16} />],
        text: 'Person',
      },
      {
        Icons: [<IconSettingsAutomation size={16} />],
        text: 'Settings',
      },
      {
        Icons: [<IconSearch size={16} />],
        text: 'Search',
      },
    ],
  },
};
