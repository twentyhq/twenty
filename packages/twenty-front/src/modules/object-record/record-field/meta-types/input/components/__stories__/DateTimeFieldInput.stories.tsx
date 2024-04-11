import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useDateTimeField } from '../../../hooks/useDateTimeField';
import {
  DateTimeFieldInput,
  DateTimeFieldInputProps,
} from '../DateTimeFieldInput';

const formattedDate = new Date(2022, 1, 1);

const DateFieldValueSetterEffect = ({ value }: { value: Date }) => {
  const { setFieldValue } = useDateTimeField();

  useEffect(() => {
    setFieldValue(value.toISOString());
  }, [setFieldValue, value]);

  return <></>;
};

type DateFieldInputWithContextProps = DateTimeFieldInputProps & {
  value: Date;
  entityId?: string;
};

const DateFieldInputWithContext = ({
  value,
  entityId,
  onEscape,
  onEnter,
  onClickOutside,
}: DateFieldInputWithContextProps) => {
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope('hotkey-scope');
  }, [setHotkeyScope]);

  return (
    <div>
      <FieldContextProvider
        fieldDefinition={{
          fieldMetadataId: 'date',
          label: 'Date',
          type: FieldMetadataType.DateTime,
          iconName: 'IconCalendarEvent',
          metadata: {
            fieldName: 'Date',
            objectMetadataNameSingular: 'person',
          },
        }}
        entityId={entityId}
      >
        <DateFieldValueSetterEffect value={value} />
        <DateTimeFieldInput
          onEscape={onEscape}
          onEnter={onEnter}
          onClickOutside={onClickOutside}
        />
      </FieldContextProvider>
      <div data-testid="data-field-input-click-outside-div"></div>
    </div>
  );
};

const escapeJestFn = fn();
const enterJestFn = fn();
const clickOutsideJestFn = fn();

const meta: Meta = {
  title: 'UI/Data/Field/Input/DateFieldInput',
  component: DateFieldInputWithContext,
  args: {
    value: formattedDate,
    onEscape: escapeJestFn,
    onEnter: enterJestFn,
    onClickOutside: clickOutsideJestFn,
  },
  argTypes: {
    onEscape: {
      control: false,
    },
    onEnter: {
      control: false,
    },
    onClickOutside: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof DateFieldInputWithContext>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const div = await canvas.findByText('Feb 1, 2022');

    await expect(div.innerText).toContain('Feb 1, 2022');
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');
    await userEvent.click(emptyDiv);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Escape: Story = {
  play: async () => {
    await expect(escapeJestFn).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{esc}');

    await expect(escapeJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Enter: Story = {
  play: async () => {
    await expect(enterJestFn).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{enter}');

    await expect(enterJestFn).toHaveBeenCalledTimes(1);
  },
};
