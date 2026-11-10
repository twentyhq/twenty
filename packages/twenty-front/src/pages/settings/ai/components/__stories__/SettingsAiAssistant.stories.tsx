import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, mocked, userEvent, waitFor, within } from 'storybook/test';
import { DEFAULT_AI_CHAT_ASSISTANT_PROFILE } from 'twenty-shared/ai';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { SettingsAiAssistantSection } from '~/pages/settings/ai/components/SettingsAiAssistantSection';
import { SettingsAiAssistantExample } from '~/pages/settings/ai/components/__stories__/SettingsAiAssistantExample';

const SCOUT_PROFILE = {
  displayName: 'Scout',
  avatarShape: 'cookie',
  avatarColor: 'orange',
  avatarFace: 'wink',
  isAvatarAnimated: false,
} as const;

const meta = {
  title: 'Pages/Settings/AI/Assistant',
  component: SettingsAiAssistantExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 694 } },
  render: (args) => (
    <SettingsAiAssistantExample
      key={JSON.stringify(args.value)}
      value={args.value}
      onChange={args.onChange}
      disabled={args.disabled}
      isSaving={args.isSaving}
      errorMessage={args.errorMessage}
      shouldRejectChanges={args.shouldRejectChanges}
    />
  ),
  args: {
    value: DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    onChange: fn(),
  },
} satisfies Meta<typeof SettingsAiAssistantExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PresetSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = canvas.getByRole('button', { name: 'Customize' });

    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();
    expect(customize).toHaveAttribute('aria-pressed', 'false');
    expect(
      canvas
        .getByRole('radio', { name: 'Ada' })
        .querySelector('[data-size="40"]'),
    ).toHaveAttribute('data-animated', 'true');
    expect(
      canvas
        .getByRole('radio', { name: 'Scout' })
        .querySelector('[data-size="40"]'),
    ).toHaveAttribute('data-animated', 'false');
    await userEvent.click(canvas.getByRole('radio', { name: 'Scout' }));
    expect(args.onChange).toHaveBeenCalledTimes(1);
    expect(args.onChange).toHaveBeenLastCalledWith(SCOUT_PROFILE);
    expect(canvas.getByRole('radio', { name: 'Scout' })).toBeChecked();

    await userEvent.click(customize);
    const animate = await body.findByRole('switch', { name: 'Animate' });
    const customPreview = customize.querySelector('[data-size="40"]');
    const namePreview = body
      .getByRole('dialog', { name: 'Customize assistant' })
      .querySelector('[data-size="20"]');

    expect(animate).not.toBeChecked();
    expect(customPreview).toHaveAttribute('data-animated', 'false');
    expect(namePreview).toHaveAttribute('data-animated', 'false');
    await userEvent.click(animate);
    expect(args.onChange).toHaveBeenCalledTimes(2);
    expect(args.onChange).toHaveBeenLastCalledWith({
      isAvatarAnimated: true,
    });
    expect(customize).toHaveAttribute('aria-pressed', 'true');
    expect(canvas.getByRole('radio', { name: 'Scout' })).not.toBeChecked();
    expect(animate).toBeChecked();
    expect(customPreview).toHaveAttribute('data-animated', 'true');
    expect(namePreview).toHaveAttribute('data-animated', 'true');
    expect(
      body
        .getByRole('button', { name: /^Shape/ })
        .querySelector('[data-size="16"]'),
    ).toHaveAttribute('data-animated', 'false');

    await userEvent.click(animate);
    expect(args.onChange).toHaveBeenCalledTimes(3);
    expect(args.onChange).toHaveBeenLastCalledWith({ isAvatarAnimated: false });
    expect(customize).toHaveAttribute('aria-pressed', 'false');
    expect(canvas.getByRole('radio', { name: 'Scout' })).toBeChecked();
    expect(animate).not.toBeChecked();
    expect(customPreview).toHaveAttribute('data-animated', 'false');
    expect(namePreview).toHaveAttribute('data-animated', 'false');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(customize).toHaveFocus());
  },
};

export const CustomEditsAndReset: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = canvas.getByRole('button', { name: 'Customize' });
    const onChange = mocked(args.onChange);

    await userEvent.click(customize);
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    await userEvent.clear(name);
    await userEvent.tab();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(name, 'Scout ]');
    await userEvent.tab();
    expect(name).toHaveValue('Scout ]');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(body.getByRole('alert')).toHaveTextContent(
      'Square brackets must be paired and cannot be nested.',
    );
    await userEvent.clear(name);
    await userEvent.type(name, '  Nimbus  ');
    onChange.mockClear();
    await userEvent.tab();
    await waitFor(() =>
      expect(body.getByRole('textbox', { name: 'Assistant name' })).toHaveValue(
        'Nimbus',
      ),
    );
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({
      displayName: 'Nimbus',
    });
    expect(
      body.getByRole('textbox', { name: 'Assistant name' }),
    ).not.toHaveAttribute('aria-invalid', 'true');

    onChange.mockClear();
    await userEvent.click(body.getByRole('button', { name: /^Shape/ }));
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Cloud' }),
    );
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({
      avatarShape: 'cloud',
    });
    expect(body.getByRole('menuitemradio', { name: 'Cloud' })).toBeChecked();
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Back to customization' }),
    );

    onChange.mockClear();
    await userEvent.click(body.getByRole('button', { name: /^Color/ }));
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Purple' }),
    );
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({
      avatarColor: 'purple',
    });
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Back to customization' }),
    );

    onChange.mockClear();
    await userEvent.click(body.getByRole('button', { name: /^Face/ }));
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Happy' }),
    );
    expect(onChange).toHaveBeenCalledOnce();
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Back to customization' }),
    );
    expect(onChange).toHaveBeenCalledWith({
      avatarFace: 'happy',
    });
    expect(customize).toHaveAttribute('aria-pressed', 'true');
    expect(body.getByRole('textbox', { name: 'Assistant name' })).toHaveValue(
      'Nimbus',
    );

    onChange.mockClear();
    await userEvent.click(body.getByRole('button', { name: 'Reset to Ada' }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(DEFAULT_AI_CHAT_ASSISTANT_PROFILE);
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();
    expect(customize).toHaveAttribute('aria-pressed', 'false');
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const ada = canvas.getByRole('radio', { name: 'Ada' });
    const customize = canvas.getByRole('button', { name: 'Customize' });

    ada.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(canvas.getByRole('radio', { name: 'Scout' })).toBeChecked();
    expect(args.onChange).toHaveBeenCalledTimes(1);
    expect(args.onChange).toHaveBeenLastCalledWith(SCOUT_PROFILE);

    customize.focus();
    await userEvent.keyboard('{Enter}');
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    await waitFor(() => expect(name).toHaveFocus());
    await userEvent.keyboard('{ArrowLeft}');
    expect(name).toHaveFocus();
    await userEvent.tab();
    const shape = body.getByRole('button', { name: /^Shape/ });

    expect(shape).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await body.findByRole('menuitemradio', { name: 'Circle' });
    await userEvent.keyboard('{End}{Enter}');
    expect(args.onChange).toHaveBeenCalledTimes(2);
    expect(args.onChange).toHaveBeenLastCalledWith({
      avatarShape: 'hexagon',
    });
    expect(body.getByRole('menuitemradio', { name: 'Hexagon' })).toBeChecked();

    await userEvent.keyboard('{Home}{Enter}');
    await waitFor(() => expect(shape).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(customize).toHaveFocus());
    expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    for (const radio of canvas.getAllByRole('radio')) {
      expect(radio).toHaveAttribute('aria-disabled', 'true');
    }

    const customize = canvas.getByRole('button', { name: 'Customize' });

    expect(customize).toBeDisabled();
    await userEvent.click(customize);
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Saving: Story = {
  args: { isSaving: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('status')).toHaveTextContent(
      'Saving assistant settings...',
    );
    expect(
      canvas.getByRole('radiogroup', { name: 'Assistant avatar' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(canvas.getByRole('button', { name: 'Customize' })).toBeDisabled();
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const SavingWhileOpen: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const [isSaving, setIsSaving] = useState(false);

    return (
      <>
        <SettingsAiAssistantSection
          value={value}
          onChange={(nextValue) => {
            args.onChange(nextValue);
            setValue((previousValue) => ({ ...previousValue, ...nextValue }));
            setIsSaving(true);
          }}
          isSaving={isSaving}
        />
        <Button onClick={() => setIsSaving(false)}>Finish saving</Button>
      </>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = canvas.getByRole('button', { name: 'Customize' });

    await userEvent.click(customize);
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    await userEvent.type(name, 'x');
    expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(args.onChange).toHaveBeenLastCalledWith({
      displayName: 'Adax',
    });
    expect(body.getByRole('dialog')).toBeVisible();
    expect(
      body.getByRole('textbox', { name: 'Assistant name' }),
    ).toBeDisabled();
    expect(customize).toBeDisabled();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Finish saving' }),
    );
    await waitFor(() => expect(customize).not.toBeDisabled());
    await userEvent.click(customize);
    expect(
      await body.findByRole('textbox', { name: 'Assistant name' }),
    ).not.toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(args.onChange).toHaveBeenCalledOnce();
  },
};

export const SavingNameKeepsNavigationClick: Story = {
  render: SavingWhileOpen.render,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Customize' }));
    await userEvent.type(
      await body.findByRole('textbox', { name: 'Assistant name' }),
      'x',
    );
    await userEvent.click(body.getByRole('button', { name: /^Shape/ }));

    expect(args.onChange).toHaveBeenCalledOnce();
    expect(args.onChange).toHaveBeenCalledWith({ displayName: 'Adax' });
    expect(
      await body.findByRole('menuitemradio', { name: 'Cloud' }),
    ).toBeDisabled();
  },
};

export const FailedChange: Story = {
  args: {
    errorMessage: 'Unable to save assistant settings. Try again.',
    shouldRejectChanges: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('alert')).toHaveTextContent(
      'Unable to save assistant settings. Try again.',
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'Scout' }));
    expect(args.onChange).toHaveBeenCalledOnce();
    expect(args.onChange).toHaveBeenLastCalledWith(SCOUT_PROFILE);
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();
    expect(canvas.getByRole('radio', { name: 'Scout' })).not.toBeChecked();

    const body = within(canvasElement.ownerDocument.body);
    const customize = canvas.getByRole('button', { name: 'Customize' });

    await userEvent.click(customize);
    const animate = await body.findByRole('switch', { name: 'Animate' });

    await userEvent.click(animate);
    expect(args.onChange).toHaveBeenCalledTimes(2);
    expect(args.onChange).toHaveBeenLastCalledWith({
      isAvatarAnimated: false,
    });
    expect(animate).toBeChecked();
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();
    expect(customize.querySelector('[data-size="40"]')).toHaveAttribute(
      'data-animated',
      'true',
    );
    expect(
      body
        .getByRole('dialog', { name: 'Customize assistant' })
        .querySelector('[data-size="20"]'),
    ).toHaveAttribute('data-animated', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(customize).toHaveFocus());
  },
};

export const Narrow: Story = {
  parameters: { container: { width: 320 } },
  args: {
    value: {
      displayName: 'Nimbus',
      avatarShape: 'cloud',
      avatarColor: 'purple',
      avatarFace: 'default',
      isAvatarAnimated: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = canvas.getByRole('button', { name: 'Customize' });
    const group = canvas.getByRole('radiogroup', { name: 'Assistant avatar' });

    expect(customize).toHaveAttribute('aria-pressed', 'true');
    expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
    await userEvent.click(customize);
    await userEvent.click(body.getByRole('button', { name: /^Shape/ }));
    expect(
      await body.findByRole('menuitemradio', { name: 'Cloud' }),
    ).toBeChecked();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(customize).toHaveFocus());
  },
};
