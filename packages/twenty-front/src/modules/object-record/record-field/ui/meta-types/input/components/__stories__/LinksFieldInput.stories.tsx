import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useLinksField } from '@/object-record/record-field/ui/meta-types/hooks/useLinksField';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { LinksFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldInput';

const updateRecord = fn();

const {
  FieldInputEventContextProviderWithJestMocks,
  handleEscapeMocked,
  handleClickoutsideMocked,
} = getFieldInputEventContextProviderWithJestMocks();

const LinksValueSetterEffect = ({
  value,
}: {
  value: {
    primaryLinkUrl: string | null;
    primaryLinkLabel: string | null;
    secondaryLinks: Array<{ url: string | null; label: string | null }> | null;
  };
}) => {
  const { setFieldValue, setDraftValue } = useLinksField();

  useEffect(() => {
    setFieldValue(value);
    setDraftValue(value);
  }, [setFieldValue, value, setDraftValue]);

  return null;
};

type LinksInputWithContextProps = {
  value: {
    primaryLinkUrl: string | null;
    primaryLinkLabel: string | null;
    secondaryLinks: Array<{ url: string | null; label: string | null }> | null;
  };
  recordId: string;
};

const LinksFieldValueGater = () => {
  const { fieldValue } = useLinksField();

  return fieldValue && <LinksFieldInput />;
};

const LinksInputWithContext = ({
  value,
  recordId,
}: LinksInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'Links',
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
  }, [pushFocusItemToFocusStack, instanceId]);

  return (
    <div>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: instanceId,
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
            recordId,
            isLabelIdentifier: false,
            isRecordFieldReadOnly: false,
            useUpdateRecord: () => [updateRecord, { loading: false }],
          }}
        >
          <FieldInputEventContextProviderWithJestMocks>
            <LinksValueSetterEffect value={value} />
            <LinksFieldValueGater />
          </FieldInputEventContextProviderWithJestMocks>
        </FieldContext.Provider>
      </RecordFieldComponentInstanceContext.Provider>
      <div data-testid="links-field-input-click-outside-div" />
    </div>
  );
};

const getPrimaryLinkBookmarkIcon = (canvasElement: HTMLElement) =>
  // It would be better to use an aria-label on the icon, but we'll do this for now
  canvasElement.querySelector('svg[class*="tabler-icon-bookmark"]');

const meta: Meta = {
  title: 'UI/Data/Field/Input/LinksFieldInput',
  component: LinksInputWithContext,
  decorators: [I18nFrontDecorator],
  args: {
    value: {
      primaryLinkUrl: null,
      primaryLinkLabel: null,
      secondaryLinks: null,
    },
    recordId: '123',
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

    expect(getPrimaryLinkBookmarkIcon(canvasElement)).not.toBeInTheDocument();
  },
};

export const TrimInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.type(input, '  https://www.twenty.com  {enter}');

    const linkDisplay = await canvas.findByText('twenty.com');
    expect(linkDisplay).toBeVisible();

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
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.click(input);

    expect(handleClickoutsideMocked).toHaveBeenCalledTimes(0);

    const outsideDiv = await canvas.findByTestId(
      'links-field-input-click-outside-div',
    );
    await userEvent.click(outsideDiv);

    expect(handleClickoutsideMocked).toHaveBeenCalledTimes(1);
  },
};

export const Cancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleEscapeMocked).toHaveBeenCalledTimes(0);

    const input = await canvas.findByPlaceholderText('URL');
    await userEvent.click(input);

    await userEvent.keyboard('{escape}');

    expect(handleEscapeMocked).toHaveBeenCalledTimes(1);
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
