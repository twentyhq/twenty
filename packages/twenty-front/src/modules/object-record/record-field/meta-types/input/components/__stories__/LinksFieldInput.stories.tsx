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

const getPrimaryLinkBookmarkIcon = (canvasElement: HTMLElement) =>
  // It would be better to use an aria-label on the icon, but we'll do this for now
  canvasElement.querySelector('svg[class*="tabler-icon-bookmark"]');

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
    expect(primaryLink).toBeVisible();

    const addButton = await canvas.findByText('Add URL');
    expect(addButton).toBeVisible();

    expect(getPrimaryLinkBookmarkIcon(canvasElement)).not.toBeInTheDocument();
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
    expect(primaryLink).toBeVisible();

    await waitFor(() => {
      expect(getPrimaryLinkBookmarkIcon(canvasElement)).toBeVisible();
    });

    const documentationLink = await canvas.findByText('Documentation');
    expect(documentationLink).toBeVisible();

    const githubLink = await canvas.findByText('GitHub');
    expect(githubLink).toBeVisible();

    const addButton = await canvas.findByText('Add URL');
    expect(addButton).toBeVisible();
  },
};

export const CreatePrimaryLink: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.type(input, 'https://www.twenty.com{enter}');

    const linkDisplay = await canvas.findByText('twenty.com');
    expect(linkDisplay).toBeVisible();

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

    expect(getPrimaryLinkBookmarkIcon(canvasElement)).not.toBeInTheDocument();
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

    const primaryLink = await canvas.findByText('Twenty Website');
    expect(primaryLink).toBeVisible();

    expect(getPrimaryLinkBookmarkIcon(canvasElement)).not.toBeInTheDocument();

    const addButton = await canvas.findByText('Add URL');
    await userEvent.click(addButton);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.type(input, 'https://docs.twenty.com{enter}');

    const secondaryLink = await canvas.findByText('docs.twenty.com');
    expect(secondaryLink).toBeVisible();

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
    expect(listItemToDelete).toBeVisible();

    expect(getPrimaryLinkBookmarkIcon(canvasElement)).not.toBeInTheDocument();

    const openDropdownButton = await canvas.findByRole('button', {
      expanded: false,
    });
    await userEvent.click(openDropdownButton);

    const deleteOption = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Delete');
    await userEvent.click(deleteOption);

    const input = await canvas.findByPlaceholderText('URL');
    expect(input).toBeVisible();
    expect(input).toHaveValue('');

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

export const DeletePrimaryLinkAndUseSecondaryLinkAsTheNewPrimaryLink: Story = {
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

    const listItemToDelete = await canvas.findByText('Twenty Website');
    expect(listItemToDelete).toBeVisible();

    await waitFor(() => {
      expect(getPrimaryLinkBookmarkIcon(canvasElement)).toBeVisible();
    });

    const openDropdownButtons = await canvas.findAllByRole('button', {
      expanded: false,
    });
    await userEvent.click(openDropdownButtons[0]);

    const deleteOption = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Delete');
    await userEvent.click(deleteOption);

    const newPrimaryLink = await canvas.findByText('Documentation');
    expect(newPrimaryLink).toBeVisible();
    const oldPrimaryLink = canvas.queryByText('Twenty Website');
    expect(oldPrimaryLink).not.toBeInTheDocument();

    expect(getPrimaryLinkBookmarkIcon(canvasElement)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: '123' },
          updateOneRecordInput: {
            links: {
              primaryLinkUrl: 'https://docs.twenty.com',
              primaryLinkLabel: 'Documentation',
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

    await waitFor(() => {
      expect(getPrimaryLinkBookmarkIcon(canvasElement)).toBeVisible();
    });

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
    expect(primaryLink).toBeVisible();
    const secondaryLink = canvas.queryByText('Documentation');
    expect(secondaryLink).not.toBeInTheDocument();

    expect(getPrimaryLinkBookmarkIcon(canvasElement)).not.toBeInTheDocument();

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

export const MakeSecondaryLinkPrimary: Story = {
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

    const primaryLink = await canvas.findByText('Twenty Website');
    expect(primaryLink).toBeVisible();

    const secondaryLink = await canvas.findByText('Documentation');
    expect(secondaryLink).toBeVisible();

    await waitFor(() => {
      expect(getPrimaryLinkBookmarkIcon(canvasElement)).toBeVisible();
    });

    await userEvent.hover(secondaryLink);

    const openDropdownButtons = await canvas.findAllByRole('button', {
      expanded: false,
    });
    await userEvent.click(openDropdownButtons[1]); // Click the secondary link's dropdown

    const setPrimaryOption = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Set as Primary');
    await userEvent.click(setPrimaryOption);

    // Documentation should now be the primary link
    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: '123' },
          updateOneRecordInput: {
            links: {
              primaryLinkUrl: 'https://docs.twenty.com',
              primaryLinkLabel: 'Documentation',
              secondaryLinks: [
                {
                  url: 'https://www.twenty.com',
                  label: 'Twenty Website',
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

export const CanNotSetPrimaryLinkAsPrimaryLink: Story = {
  args: {
    value: {
      primaryLinkUrl: 'https://www.twenty.com',
      primaryLinkLabel: 'Twenty Website',
      secondaryLinks: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryLink = await canvas.findByText('Twenty Website');
    expect(primaryLink).toBeVisible();

    expect(getPrimaryLinkBookmarkIcon(canvasElement)).not.toBeInTheDocument();

    const openDropdownButton = await canvas.findByRole('button', {
      expanded: false,
    });
    await userEvent.click(openDropdownButton);

    // Should not see "Set as Primary" option for primary link
    const setPrimaryOption = within(
      getCanvasElementForDropdownTesting(),
    ).queryByText('Set as Primary');
    expect(setPrimaryOption).not.toBeInTheDocument();
  },
};
