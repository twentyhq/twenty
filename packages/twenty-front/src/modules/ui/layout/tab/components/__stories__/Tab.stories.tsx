import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import {
  IconCheckbox,
  IconMail,
  IconSettings,
  IconUser,
} from 'twenty-ui/display';
import {
  CatalogDecorator,
  CatalogStory,
  ComponentWithRouterDecorator,
} from 'twenty-ui/testing';
import { Tab } from '../Tab';

// Mimic the TabList container styling for proper positioning
const StyledTabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 40px;
  user-select: none;
  position: relative;
  align-items: stretch;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.border.color.light};
  }
`;

const meta: Meta<typeof Tab> = {
  title: 'UI/Layout/Tab/Tab',
  component: Tab,
  decorators: [ComponentWithRouterDecorator],
  args: {
    id: 'test-tab',
    title: 'Tab title',
    active: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = {
  args: {
    title: 'General',
    Icon: IconSettings,
  },
  render: (args) => (
    <StyledTabContainer>
      <Tab
        id={args.id}
        title={args.title}
        Icon={args.Icon}
        active={args.active}
        disabled={args.disabled}
        pill={args.pill}
        to={args.to}
        logo={args.logo}
        onClick={args.onClick}
        className={args.className}
      />
    </StyledTabContainer>
  ),
};

export const Active: Story = {
  args: {
    title: 'Active Tab',
    Icon: IconUser,
    active: true,
  },
  render: (args) => (
    <StyledTabContainer>
      <Tab
        id={args.id}
        title={args.title}
        Icon={args.Icon}
        active={args.active}
        disabled={args.disabled}
        pill={args.pill}
        to={args.to}
        logo={args.logo}
        onClick={args.onClick}
        className={args.className}
      />
    </StyledTabContainer>
  ),
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Tab',
    Icon: IconCheckbox,
    disabled: true,
  },
  render: (args) => (
    <StyledTabContainer>
      <Tab
        id={args.id}
        title={args.title}
        Icon={args.Icon}
        active={args.active}
        disabled={args.disabled}
        pill={args.pill}
        to={args.to}
        logo={args.logo}
        onClick={args.onClick}
        className={args.className}
      />
    </StyledTabContainer>
  ),
};

export const WithLogo: Story = {
  args: {
    title: 'Company',
    logo: 'https://twenty-front-screenshots.s3.eu-west-3.amazonaws.com/server-icon.png',
  },
  render: (args) => (
    <StyledTabContainer>
      <Tab
        id={args.id}
        title={args.title}
        Icon={args.Icon}
        active={args.active}
        disabled={args.disabled}
        pill={args.pill}
        to={args.to}
        logo={args.logo}
        onClick={args.onClick}
        className={args.className}
      />
    </StyledTabContainer>
  ),
};

export const WithStringPill: Story = {
  args: {
    title: 'Messages',
    Icon: IconMail,
    pill: '12',
  },
  render: (args) => (
    <StyledTabContainer>
      <Tab
        id={args.id}
        title={args.title}
        Icon={args.Icon}
        active={args.active}
        disabled={args.disabled}
        pill={args.pill}
        to={args.to}
        logo={args.logo}
        onClick={args.onClick}
        className={args.className}
      />
    </StyledTabContainer>
  ),
};

export const Catalog: CatalogStory<Story, typeof Tab> = {
  args: {
    title: 'Tab title',
    Icon: IconCheckbox,
  },
  argTypes: {
    active: { control: false },
    disabled: { control: false },
    onClick: { control: false },
    to: { control: false },
  },
  render: (args) => (
    <StyledTabContainer>
      <Tab
        id={args.id}
        title={args.title}
        Icon={args.Icon}
        active={args.active}
        disabled={args.disabled}
        pill={args.pill}
        to={args.to}
        logo={args.logo}
        onClick={args.onClick}
        className={args.className}
      />
    </StyledTabContainer>
  ),
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'states',
          values: ['default', 'hover', 'active'],
          props: (state: string) =>
            state === 'default' ? {} : { className: state },
        },
        {
          name: 'Active',
          values: ['true', 'false'],
          labels: (active: string) =>
            active === 'true' ? 'active' : 'inactive',
          props: (active: string) => ({ active: active === 'true' }),
        },
        {
          name: 'Disabled',
          values: ['true', 'false'],
          labels: (disabled: string) =>
            disabled === 'true' ? 'disabled' : 'enabled',
          props: (disabled: string) => ({ disabled: disabled === 'true' }),
        },
        {
          name: 'Content',
          values: ['icon', 'logo', 'pill'],
          props: (content: string) => {
            switch (content) {
              case 'icon':
                return { Icon: IconSettings };
              case 'logo':
                return {
                  logo: 'https://twenty-front-screenshots.s3.eu-west-3.amazonaws.com/server-icon.png',
                  Icon: undefined,
                };
              case 'pill':
                return { Icon: IconMail, pill: '5' };
              default:
                return {};
            }
          },
        },
      ],
    },
    layout: 'centered',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  decorators: [CatalogDecorator],
};
