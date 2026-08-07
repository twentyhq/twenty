import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { NumberFormat } from '@/localization/constants/NumberFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useCurrencyField } from '@/object-record/record-field/ui/meta-types/hooks/useCurrencyField';
import { CurrencyFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/CurrencyFieldInput';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { CurrencyCode } from 'twenty-shared/constants';
import { StorybookFieldInputDropdownFocusIdSetterEffect } from '~/testing/components/StorybookFieldInputDropdownFocusIdSetterEffect';

const {
  FieldInputEventContextProviderWithJestMocks,
  handleEnterMocked,
  handleEscapeMocked,
  handleClickoutsideMocked,
  handleTabMocked,
  handleShiftTabMocked,
} = getFieldInputEventContextProviderWithJestMocks();

const AMOUNT_MICROS_WITH_CENTS = 458640000;

const CurrencyFieldValueSetterEffect = ({
  amountMicros,
  numberFormat,
}: {
  amountMicros: number;
  numberFormat: NumberFormat;
}) => {
  const { setFieldValue, setDraftValue } = useCurrencyField();
  const setFormatPreferences = useSetAtomState(
    workspaceMemberFormatPreferencesState,
  );

  useEffect(() => {
    setFormatPreferences((previous) => ({ ...previous, numberFormat }));
    setFieldValue({ amountMicros, currencyCode: CurrencyCode.USD });
    setDraftValue({
      amount: (amountMicros / 1000000).toString(),
      currencyCode: CurrencyCode.USD,
    });
  }, [
    setFieldValue,
    setDraftValue,
    amountMicros,
    setFormatPreferences,
    numberFormat,
  ]);

  return <></>;
};

type CurrencyFieldInputWithContextProps = {
  amountMicros: number;
  numberFormat: NumberFormat;
  recordId: string;
};

const CurrencyFieldInputWithContext = ({
  recordId,
  amountMicros,
  numberFormat,
}: CurrencyFieldInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const [isReady, setIsReady] = useState(false);

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'Amount',
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  useEffect(() => {
    if (!isReady) {
      pushFocusItemToFocusStack({
        focusId: instanceId,
        component: {
          type: FocusComponentType.OPENED_FIELD_INPUT,
          instanceId: instanceId,
        },
      });
      setIsReady(true);
    }
  }, [isReady, pushFocusItemToFocusStack, instanceId]);

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      <FieldContext.Provider
        value={{
          fieldDefinition: {
            fieldMetadataId: 'amount',
            label: 'Amount',
            iconName: 'IconCurrencyDollar',
            type: FieldMetadataType.CURRENCY,
            metadata: {
              fieldName: 'amount',
              placeHolder: 'Enter amount',
              objectMetadataNameSingular: 'opportunity',
            },
          },
          recordId,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <RecordFieldsScopeContextProvider
          value={{ scopeInstanceId: RECORD_TABLE_CELL_INPUT_ID_PREFIX }}
        >
          <FieldInputEventContextProviderWithJestMocks>
            {isReady && <StorybookFieldInputDropdownFocusIdSetterEffect />}
            <CurrencyFieldValueSetterEffect
              amountMicros={amountMicros}
              numberFormat={numberFormat}
            />
            <CurrencyFieldInput />
          </FieldInputEventContextProviderWithJestMocks>
        </RecordFieldsScopeContextProvider>
      </FieldContext.Provider>
      {isReady && <div data-testid="is-ready-marker" />}
      <div data-testid="data-field-input-click-outside-div" />
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleEnterMocked.mockClear();
    handleEscapeMocked.mockClear();
    handleClickoutsideMocked.mockClear();
    handleTabMocked.mockClear();
    handleShiftTabMocked.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/CurrencyFieldInput',
  component: CurrencyFieldInputWithContext,
  args: {
    recordId: '123',
    amountMicros: AMOUNT_MICROS_WITH_CENTS,
    numberFormat: NumberFormat.DOTS_AND_COMMA,
  },
  decorators: [clearMocksDecorator, SnackBarDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof CurrencyFieldInputWithContext>;

export const Default: Story = {};

export const ClickOutsideKeepsCentsWithDotsAndComma: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleClickoutsideMocked).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.click(
      canvas.getByTestId('data-field-input-click-outside-div'),
    );

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledTimes(1);
    });

    expect(handleClickoutsideMocked).toHaveBeenCalledWith(
      expect.objectContaining({
        newValue: {
          amountMicros: AMOUNT_MICROS_WITH_CENTS,
          currencyCode: CurrencyCode.USD,
        },
        skipPersist: true,
      }),
    );
  },
};

export const ClickOutsideKeepsCentsWithCommasAndDot: Story = {
  args: { numberFormat: NumberFormat.COMMAS_AND_DOT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleClickoutsideMocked).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.click(
      canvas.getByTestId('data-field-input-click-outside-div'),
    );

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledTimes(1);
    });

    expect(handleClickoutsideMocked).toHaveBeenCalledWith(
      expect.objectContaining({
        newValue: {
          amountMicros: AMOUNT_MICROS_WITH_CENTS,
          currencyCode: CurrencyCode.USD,
        },
        skipPersist: true,
      }),
    );
  },
};

export const EscapeKeepsCents: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleEscapeMocked).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{esc}');

    await waitFor(() => {
      expect(handleEscapeMocked).toHaveBeenCalledTimes(1);
    });

    expect(handleEscapeMocked).toHaveBeenCalledWith(
      expect.objectContaining({
        newValue: {
          amountMicros: AMOUNT_MICROS_WITH_CENTS,
          currencyCode: CurrencyCode.USD,
        },
        skipPersist: true,
      }),
    );
  },
};
