import { useEffect } from 'react';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useEmailField } from '../../../hooks/useEmailField';
import { EmailFieldInput, EmailFieldInputProps } from '../EmailFieldInput';

const EmailFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useEmailField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type EmailFieldInputWithContextProps = EmailFieldInputProps & {
  value: string;
  entityId?: string;
};

const EmailFieldInputWithContext = ({
  entityId,
  value,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: EmailFieldInputWithContextProps) => {
  const setHotKeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotKeyScope('hotkey-scope');
  }, [setHotKeyScope]);

  return (
    <div>
      <FieldContextProvider
        fieldDefinition={{
          fieldMetadataId: 'email',
          label: 'Email',
          type: FieldMetadataType.Email,
          iconName: 'IconLink',
          metadata: {
            fieldName: 'email',
            placeHolder: 'username@email.com',
          },
        }}
        entityId={entityId}
      >
        <EmailFieldValueSetterEffect value={value} />
        <EmailFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      </FieldContextProvider>
      <div data-testid="data-field-input-click-outside-div" />
    </div>
  );
};

const enterJestFn = fn();
const escapeJestfn = fn();
const clickOutsideJestFn = fn();
const tabJestFn = fn();
const shiftTabJestFn = fn();

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    enterJestFn.mockClear();
    escapeJestfn.mockClear();
    clickOutsideJestFn.mockClear();
    tabJestFn.mockClear();
    shiftTabJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/EmailFieldInput',
  component: EmailFieldInputWithContext,
  args: {
    value: 'username@email.com',
    onEnter: enterJestFn,
    onEscape: escapeJestfn,
    onClickOutside: clickOutsideJestFn,
    onTab: tabJestFn,
    onShiftTab: shiftTabJestFn,
  },
  argTypes: {
    onEnter: { control: false },
    onEscape: { control: false },
    onClickOutside: { control: false },
    onTab: { control: false },
    onShiftTab: { control: false },
  },
  decorators: [clearMocksDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof EmailFieldInputWithContext>;

export const Default: Story = {};

export const Enter: Story = {
  play: async () => {
    expect(enterJestFn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      userEvent.keyboard('{enter}');
      expect(enterJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const Escape: Story = {
  play: async () => {
    expect(escapeJestfn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      userEvent.keyboard('{esc}');
      expect(escapeJestfn).toHaveBeenCalledTimes(1);
    });
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');

    await waitFor(() => {
      userEvent.click(emptyDiv);
      expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const Tab: Story = {
  play: async () => {
    expect(tabJestFn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      userEvent.keyboard('{tab}');
      expect(tabJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const ShiftTab: Story = {
  play: async () => {
    expect(shiftTabJestFn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      userEvent.keyboard('{shift>}{tab}');
      expect(shiftTabJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
