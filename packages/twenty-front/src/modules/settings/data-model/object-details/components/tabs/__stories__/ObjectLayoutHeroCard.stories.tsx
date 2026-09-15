import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsDiscoveryHeroCardFooter } from '@/settings/components/SettingsDiscoveryHeroCardFooter';
import recordPageLayoutCoverDark from '@/settings/data-model/object-details/assets/record-page-layout-cover-dark.png';
import recordPageLayoutCoverLight from '@/settings/data-model/object-details/assets/record-page-layout-cover-light.png';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { IconAddressBook, IconPencil } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCanvas = styled.div`
  background: ${themeCssVariables.background.primary};
  box-sizing: border-box;
  padding: 32px;
  width: 758px;
`;

const meta: Meta = {
  title: 'Modules/Settings/Data Model/Object Layout Hero Card',
};

export default meta;

type Story = StoryObj;

const renderCard = (colorScheme: 'light' | 'dark') => (
  <ThemeProvider colorScheme={colorScheme} applyToRoot={false}>
    <StyledCanvas>
      <SettingsDiscoveryHeroCard
        lightSrc={recordPageLayoutCoverLight}
        darkSrc={recordPageLayoutCoverDark}
        coverHeight={153}
        instanceIdPrefix={`object-layout-${colorScheme}`}
        tabs={[]}
        footer={
          <SettingsDiscoveryHeroCardFooter
            Icon={IconAddressBook}
            title="Customize record page"
            description="Customize how your record page looks."
            action={
              <Button
                title="Customize"
                variant="primary"
                accent="blue"
                size="small"
                Icon={IconPencil}
              />
            }
          />
        }
      />
    </StyledCanvas>
  </ThemeProvider>
);

export const Light: Story = {
  render: () => renderCard('light'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('Customize record page')).toBeVisible();
    expect(
      canvas.getByText('Customize how your record page looks.'),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Customize ...' })).toBeEnabled();
  },
};

export const Dark: Story = {
  render: () => renderCard('dark'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('Customize record page')).toBeVisible();
    expect(
      canvas.getByText('Customize how your record page looks.'),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Customize ...' })).toBeEnabled();
  },
};
