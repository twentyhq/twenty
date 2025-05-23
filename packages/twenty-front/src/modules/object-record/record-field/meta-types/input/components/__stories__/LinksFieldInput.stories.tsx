import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { LinksFieldInput } from '../LinksFieldInput';

const updateRecord = fn();

const LinksValueSetterEffect = ({
  value,
}: {
  value: {
    primaryLinkUrl: string | null;
    primaryLinkLabel: string | null;
    secondaryLinks: Array<{ url: string | null; label: string | null }> | null;
  };
}) => {
  const { setFieldValue } = useLinksField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

type LinksInputWithContextProps = {
  value: {
    primaryLinkUrl: string | null;
    primaryLinkLabel: string | null;
    secondaryLinks: Array<{ url: string | null; label: string | null }> | null;
  };
  recordId?: string;
  onCancel?: () => void;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
};

type LinksFieldValueGaterProps = Pick<
  LinksInputWithContextProps,
  'onCancel' | 'onClickOutside'
>;

const LinksFieldValueGater = ({
  onCancel,
  onClickOutside,
}: LinksFieldValueGaterProps) => {
  const { fieldValue } = useLinksField();

  return (
    fieldValue && (
      <LinksFieldInput onCancel={onCancel} onClickOutside={onClickOutside} />
    )
  );
};

const LinksInputWithContext = ({
  value,
  recordId,
  onCancel,
  onClickOutside,
}: LinksInputWithContextProps) => {
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope);
  }, [setHotkeyScope]);

  return (
    <div>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: getRecordFieldInputId(
            recordId ?? '',
            'Links',
            'record-table-cell',
          ),
        }}
      >
        <FieldContext.Provider
          value={{
            fieldDefinition: {
              fieldMetadataId: 'links',
              label: 'Links',
              type: FieldMetadataType.LINKS,
              iconName: 'IconLink',
              metadata: {
                fieldName: 'links',
                placeHolder: 'Enter URL',
                objectMetadataNameSingular: 'company',
              },
            },
            recordId: recordId ?? '123',
            isLabelIdentifier: false,
            isReadOnly: false,
            useUpdateRecord: () => [updateRecord, { loading: false }],
          }}
        >
          <LinksValueSetterEffect value={value} />
          <LinksFieldValueGater
            onCancel={onCancel}
            onClickOutside={onClickOutside}
          />
        </FieldContext.Provider>
      </RecordFieldComponentInstanceContext.Provider>
      <div data-testid="links-field-input-click-outside-div" />
    </div>
  );
};

const cancelJestFn = fn();
const clickOutsideJestFn = fn();

const meta: Meta = {
  title: 'UI/Data/Field/Input/LinksFieldInput',
  component: LinksInputWithContext,
  args: {
    value: {
      primaryLinkUrl: null,
      primaryLinkLabel: null,
      secondaryLinks: null,
    },
    onCancel: cancelJestFn,
    onClickOutside: clickOutsideJestFn,
  },
  argTypes: {
    onCancel: { control: false },
    onClickOutside: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof LinksInputWithContext>;

export const EmptyState: Story = {
  args: {
    value: {
      primaryLinkUrl: null,
      primaryLinkLabel: null,
      secondaryLinks: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('URL');
    expect(input).toBeVisible();
    expect(input).toHaveValue('');

    const addButton = canvas.queryByText('Add URL');
    expect(addButton).not.toBeInTheDocument();
  },
};

export const PrimaryLinkOnly: Story = {
  args: {
    value: {
      primaryLinkUrl: 'https://www.twenty.com',
      primaryLinkLabel: 'Twenty Website',
      secondaryLinks: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryLink = await canvas.findByText('Twenty Website');
    await expect(primaryLink).toBeVisible();

    const addButton = await canvas.findByText('Add URL');
    await expect(addButton).toBeVisible();
  },
};

export const WithSecondaryLinks: Story = {
  args: {
    value: {
      primaryLinkUrl: 'https://www.twenty.com',
      primaryLinkLabel: 'Twenty Website',
      secondaryLinks: [
        {
          url: 'https://docs.twenty.com',
          label: 'Documentation',
        },
        {
          url: 'https://github.com/twentyhq/twenty',
          label: 'GitHub',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryLink = await canvas.findByText('Twenty Website');
    await expect(primaryLink).toBeVisible();

    const documentationLink = await canvas.findByText('Documentation');
    await expect(documentationLink).toBeVisible();

    const githubLink = await canvas.findByText('GitHub');
    await expect(githubLink).toBeVisible();

    const addButton = await canvas.findByText('Add URL');
    await expect(addButton).toBeVisible();
  },
};

export const CreatePrimaryLink: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.type(input, 'https://www.twenty.com{enter}');

    const linkDisplay = await canvas.findByText('twenty.com');
    await expect(linkDisplay).toBeVisible();

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: '123' },
          updateOneRecordInput: {
            links: {
              primaryLinkUrl: 'https://www.twenty.com',
              primaryLinkLabel: null,
              secondaryLinks: [],
            },
          },
        },
      });
    });
    expect(updateRecord).toHaveBeenCalledTimes(1);
  },
};

export const AddSecondaryLink: Story = {
  args: {
    value: {
      primaryLinkUrl: 'https://www.twenty.com',
      primaryLinkLabel: 'Twenty Website',
      secondaryLinks: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = await canvas.findByText('Add URL');
    await userEvent.click(addButton);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.type(input, 'https://docs.twenty.com{enter}');

    const primaryLink = await canvas.findByText('Twenty Website');
    const secondaryLink = await canvas.findByText('docs.twenty.com');
    await expect(primaryLink).toBeVisible();
    await expect(secondaryLink).toBeVisible();

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: '123' },
          updateOneRecordInput: {
            links: {
              primaryLinkUrl: 'https://www.twenty.com',
              primaryLinkLabel: 'Twenty Website',
              secondaryLinks: [
                {
                  url: 'https://docs.twenty.com',
                  label: null,
                },
              ],
            },
          },
        },
      });
    });
    expect(updateRecord).toHaveBeenCalledTimes(1);
  },
};

export const DeletePrimaryLink: Story = {
  args: {
    value: {
      primaryLinkUrl: 'https://www.twenty.com',
      primaryLinkLabel: 'Twenty Website',
      secondaryLinks: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const listItemToDelete = await canvas.findByText('Twenty Website');
    await userEvent.hover(listItemToDelete);

    const openDropdownButton = await canvas.findByRole('button', {
      expanded: false,
    });
    await userEvent.click(openDropdownButton);

    const deleteOption = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Delete');
    await userEvent.click(deleteOption);

    const input = await canvas.findByPlaceholderText('URL');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('');

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: '123' },
          updateOneRecordInput: {
            links: {
              primaryLinkUrl: null,
              primaryLinkLabel: null,
              secondaryLinks: [],
            },
          },
        },
      });
    });
    expect(updateRecord).toHaveBeenCalledTimes(1);
  },
};

export const DeleteSecondaryLink: Story = {
  args: {
    value: {
      primaryLinkUrl: 'https://www.twenty.com',
      primaryLinkLabel: 'Twenty Website',
      secondaryLinks: [
        {
          url: 'https://docs.twenty.com',
          label: 'Documentation',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const listItemToDelete = await canvas.findByText('Documentation');
    await userEvent.hover(listItemToDelete);

    const openDropdownButtons = await canvas.findAllByRole('button', {
      expanded: false,
    });
    await userEvent.click(openDropdownButtons[1]);

    const deleteOption = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Delete');
    await userEvent.click(deleteOption);

    const primaryLink = await canvas.findByText('Twenty Website');
    await expect(primaryLink).toBeVisible();
    const secondaryLink = canvas.queryByText('Documentation');
    await expect(secondaryLink).not.toBeInTheDocument();

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: '123' },
          updateOneRecordInput: {
            links: {
              primaryLinkUrl: 'https://www.twenty.com',
              primaryLinkLabel: 'Twenty Website',
              secondaryLinks: [],
            },
          },
        },
      });
    });
    expect(updateRecord).toHaveBeenCalledTimes(1);
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.click(input);

    expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    const outsideDiv = await canvas.findByTestId(
      'links-field-input-click-outside-div',
    );
    await userEvent.click(outsideDiv);

    expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Cancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(cancelJestFn).toHaveBeenCalledTimes(0);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.click(input);

    await userEvent.keyboard('{escape}');

    expect(cancelJestFn).toHaveBeenCalledTimes(1);
  },
};

export const InvalidUrls: Story = {
  args: {
    value: {
      primaryLinkUrl: 'lydia,com',
      primaryLinkLabel: 'Invalid URL',
      secondaryLinks: [
        { url: 'wikipedia', label: 'Missing Protocol' },
        { url: '\\invalid', label: 'Invalid Characters' },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('URL');
    expect(input).toBeVisible();
    expect(input).toHaveValue('');

    await waitFor(() => {
      expect(canvas.queryByRole('link')).toBeNull();
    });

    expect(canvas.queryByText('Invalid URL')).not.toBeInTheDocument();
    expect(canvas.queryByText('Missing Protocol')).not.toBeInTheDocument();
    expect(canvas.queryByText('Invalid Characters')).not.toBeInTheDocument();
  },
};
