import { SettingsRadioCardContainer } from '@/settings/components/SettingsRadioCardContainer';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { msg } from '@lingui/core/macro';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const SettingsRadioCardsExample = ({
  onChange,
}: {
  onChange: (value: string) => void;
}) => {
  const [value, setValue] = useState('saml');

  return (
    <SettingsRadioCardContainer
      options={[
        {
          value: 'saml',
          title: 'SAML',
          description: 'Enterprise authentication',
        },
        { value: 'oidc', title: 'OIDC', description: 'OpenID Connect' },
      ]}
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
    />
  );
};

const meta: Meta<typeof SettingsRadioCardsExample> = {
  title: 'Modules/Settings/RadioCards',
  component: SettingsRadioCardsExample,
  args: { onChange: fn() },
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsRadioCardsExample>;

export const AuthenticationChoices: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('OpenID Connect'));
    await expect(canvas.getByRole('radio', { name: 'OIDC' })).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'SAML' })).toBeChecked(),
    );
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

const ExpandedCardExample = ({
  onChange,
}: {
  onChange: (value: string) => void;
}) => {
  const [value, setValue] = useState('all');

  return (
    <SettingsRadioSettingsCard
      name="sync"
      options={[
        {
          value: 'all',
          title: msg`All messages`,
          description: msg`Sync every message`,
          cardMedia: null,
        },
        {
          value: 'selected',
          title: msg`Selected folders`,
          description: msg`Choose folders to sync`,
          cardMedia: null,
          cardContentExpanded: <input aria-label="Folder name" />,
        },
      ]}
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
    />
  );
};

export const ExpandedContent: Story = {
  render: (args) => <ExpandedCardExample onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Choose folders to sync'));
    await expect(
      canvas.getByRole('radio', { name: 'Selected folders' }),
    ).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    const folderNameInput = canvas.getByRole('textbox', {
      name: 'Folder name',
    });
    await userEvent.type(folderNameInput, 'Inbox');
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(folderNameInput).toHaveValue('Inbox');

    for (const key of [
      '{ArrowRight}',
      '{ArrowDown}',
      '{Home}',
      '{ArrowLeft}',
      '{ArrowUp}',
      '{End}',
    ]) {
      await userEvent.keyboard(key);
      await expect(
        canvas.getByRole('radio', { name: 'Selected folders' }),
      ).toBeChecked();
      await expect(args.onChange).toHaveBeenCalledTimes(1);
      await expect(folderNameInput).toHaveFocus();
    }

    await userEvent.keyboard('{ArrowLeft}X');
    await expect(folderNameInput).toHaveValue('InboXx');
    await userEvent.click(
      canvas.getByRole('radio', { name: 'Selected folders' }),
    );
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'All messages' })).toBeChecked(),
    );
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(
      canvas.queryByRole('textbox', { name: 'Folder name' }),
    ).not.toBeInTheDocument();
  },
};
