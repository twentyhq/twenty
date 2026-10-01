import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useAddressField } from '@/object-record/record-field/ui/meta-types/hooks/useAddressField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { AddressFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/AddressFieldInput';
import {
  FieldInputEventContext,
  type FieldInputEventContextType,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import {
  WorkspaceSurfaceContext,
  type WorkspaceSurfaceContextValue,
} from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { Button } from 'twenty-ui/primitives/input';
import { graphql, HttpResponse } from 'msw';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const AddressValueSetterEffect = ({
  value,
}: {
  value: FieldAddressDraftValue;
}) => {
  const { setFieldValue, setDraftValue } = useAddressField();

  useEffect(() => {
    setFieldValue(value);
    setDraftValue(value);
  }, [setDraftValue, setFieldValue, value]);

  return <></>;
};

const InitializedAddressFieldInput = () => {
  const { draftValue } = useAddressField();

  return isDefined(draftValue) ? <AddressFieldInput /> : null;
};

type AddressInputWithContextProps = FieldInputEventContextType & {
  value: FieldAddressDraftValue;
  recordId?: string;
  surface?: WorkspaceSurfaceContextValue;
};

const AddressInputWithContext = ({
  recordId,
  value,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
  surface = { type: 'main', instanceId: 'main', ownsRouteLocation: true },
}: AddressInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const instanceId = getRecordFieldInputInstanceId({
    recordId: recordId ?? '',
    fieldName: 'Address',
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.OPENED_FIELD_INPUT,
        instanceId: instanceId,
      },
    });
  }, [instanceId, pushFocusItemToFocusStack]);

  return (
    <WorkspaceSurfaceContext.Provider value={surface}>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: instanceId,
        }}
      >
        <FieldContext.Provider
          value={{
            fieldDefinition: {
              fieldMetadataId: 'text',
              label: 'Address',
              type: FieldMetadataType.ADDRESS,
              iconName: 'IconTag',
              metadata: {
                fieldName: 'Address',
                placeHolder: 'Enter text',
                objectMetadataNameSingular: 'person',
              },
            },
            recordId: recordId ?? '123',
            isLabelIdentifier: false,
            isRecordFieldReadOnly: false,
          }}
        >
          <AddressValueSetterEffect value={value} />
          <FieldInputEventContext.Provider
            value={{ onEnter, onEscape, onClickOutside, onTab, onShiftTab }}
          >
            <InitializedAddressFieldInput />
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
        <Button>Outside</Button>
      </RecordFieldComponentInstanceContext.Provider>
    </WorkspaceSurfaceContext.Provider>
  );
};

const enterJestFn = fn();
const escapeJestfn = fn();
const clickOutsideJestFn = fn();
const tabJestFn = fn();
const shiftTabJestFn = fn();
const autocompleteResponseJestFn = fn();

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    enterJestFn.mockClear();
    escapeJestfn.mockClear();
    clickOutsideJestFn.mockClear();
    tabJestFn.mockClear();
    shiftTabJestFn.mockClear();
    autocompleteResponseJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/AddressFieldInput',
  component: AddressInputWithContext,
  args: {
    value: {
      addressStreet1: 'Address 1',
      addressStreet2: null,
      addressCity: null,
      addressState: null,
      addressPostcode: null,
      addressCountry: null,
      addressLat: null,
      addressLng: null,
    },
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
    mockingDate: null,
    msw: {
      handlers: [
        graphql.query('GetAutoCompleteAddress', ({ variables }) => {
          autocompleteResponseJestFn(variables.address);

          if (variables.address.includes('Nowhere')) {
            return HttpResponse.json({ data: { getAutoCompleteAddress: [] } });
          }

          return HttpResponse.json({
            data: {
              getAutoCompleteAddress: [
                {
                  text: variables.isFieldCity
                    ? 'Paris, France'
                    : '10 Rue de Rivoli, Paris',
                  placeId: variables.isFieldCity ? 'paris' : 'rivoli',
                },
              ],
            },
          });
        }),
        graphql.query('GetAddressDetails', ({ variables }) =>
          HttpResponse.json({
            data: {
              getAddressDetails: {
                street:
                  variables.placeId === 'paris' ? null : '10 Rue de Rivoli',
                state: 'Île-de-France',
                postcode: '75001',
                city: 'Paris',
                country: 'FR',
                location: { lat: 48.8566, lng: 2.3522 },
              },
            },
          }),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof AddressInputWithContext>;

export const Default: Story = {};

export const Enter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(enterJestFn).toHaveBeenCalledTimes(0);

    const addressInput = await canvas.findByRole('combobox', {
      name: 'Address 1',
    });

    await userEvent.click(addressInput);

    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(enterJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const AutofillsAndPersistsAddress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'Address 1' });

    await userEvent.clear(input);
    await userEvent.type(input, '10 Rue');
    await screen.findByRole('option', { name: '10 Rue de Rivoli, Paris' });
    expect(input).toHaveFocus();
    await userEvent.click(input);
    expect(screen.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(input).toHaveValue('10 Rue de Rivoli');
      expect(canvas.getByRole('combobox', { name: 'City' })).toHaveValue(
        'Paris',
      );
      expect(canvas.getByRole('textbox', { name: 'State' })).toHaveValue(
        'Île-de-France',
      );
      expect(canvas.getByRole('textbox', { name: 'Post Code' })).toHaveValue(
        '75001',
      );
      expect(input).toHaveFocus();
      expect(enterJestFn).not.toHaveBeenCalled();
    });

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(enterJestFn).toHaveBeenCalledWith({
        newValue: {
          addressStreet1: '10 Rue de Rivoli',
          addressStreet2: null,
          addressCity: 'Paris',
          addressState: 'Île-de-France',
          addressPostcode: '75001',
          addressCountry: 'France',
          addressLat: 48.8566,
          addressLng: 2.3522,
        },
      });
    });
  },
};

export const SelectsCityWithoutReplacingStreet: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const cityInput = canvas.getByRole('combobox', { name: 'City' });

    await userEvent.type(cityInput, 'Par');
    await userEvent.click(
      await screen.findByRole('option', { name: 'Paris, France' }),
    );

    await waitFor(() => {
      expect(cityInput).toHaveValue('Paris');
      expect(cityInput).toHaveFocus();
      expect(canvas.getByRole('combobox', { name: 'Address 1' })).toHaveValue(
        'Address 1',
      );
      expect(clickOutsideJestFn).not.toHaveBeenCalled();
    });
  },
};

export const CancelsSuggestionsBeforePersisting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'Address 1' });
    const outsideButton = canvas.getByRole('button', { name: 'Outside' });

    await userEvent.type(input, ' Rue');
    await screen.findByRole('option', { name: '10 Rue de Rivoli, Paris' });
    await userEvent.click(outsideButton);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input).toHaveValue('Address 1 Rue');
      expect(clickOutsideJestFn).not.toHaveBeenCalled();
    });

    await userEvent.click(outsideButton);

    await waitFor(() => {
      expect(clickOutsideJestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          newValue: expect.objectContaining({
            addressStreet1: 'Address 1 Rue',
          }),
        }),
      );
    });
  },
};

export const IgnoresArrowKeysWithoutSuggestions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'Address 1' });

    await userEvent.type(input, ' Nowhere');
    await waitFor(() =>
      expect(autocompleteResponseJestFn).toHaveBeenCalledWith(
        'Address 1 Nowhere',
      ),
    );
    await userEvent.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(escapeJestfn).toHaveBeenCalledWith({
        newValue: expect.objectContaining({
          addressStreet1: 'Address 1 Nowhere',
        }),
      }),
    );
  },
};

export const CountryOnMainSurface: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByText('No country'));
    await userEvent.type(screen.getByPlaceholderText('Search'), 'France');
    await userEvent.click(await screen.findByText('France'));

    await waitFor(() => {
      expect(canvas.getByText('France')).toBeVisible();
      expect(clickOutsideJestFn).not.toHaveBeenCalled();
    });
  },
};

export const CountryOnSidePanelSurface: Story = {
  args: {
    surface: {
      type: 'side-panel',
      instanceId: 'side-panel-page',
      ownsRouteLocation: true,
    },
  },
  play: CountryOnMainSurface.play,
};
