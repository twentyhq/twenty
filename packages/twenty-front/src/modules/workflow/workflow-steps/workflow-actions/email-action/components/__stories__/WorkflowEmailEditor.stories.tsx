import { WorkflowEmailEditor } from '@/workflow/workflow-steps/workflow-actions/email-action/components/WorkflowEmailEditor';
import { useEmailEditor } from '@/workflow/workflow-steps/workflow-actions/email-action/hooks/useEmailEditor';
import { type Meta, type StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const EditorWrapper = ({
  readonly = false,
  placeholder = 'Enter email content...',
  defaultValue = null,
  onUpdate = fn(),
}: {
  readonly?: boolean;
  placeholder?: string;
  defaultValue?: string | null;
  onUpdate?: (content: string) => void;
}) => {
  const editor = useEmailEditor({
    placeholder,
    readonly,
    defaultValue,
    onUpdate: (editor) => {
      const jsonContent = editor.getJSON();
      onUpdate(JSON.stringify(jsonContent));
    },
    onImageUpload: async (file: File) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return `https://via.placeholder.com/400x200?text=${encodeURIComponent(file.name)}`;
    },
    onImageUploadError: (_error: Error, _file: File) => {
      // Handle image upload error
    },
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return <WorkflowEmailEditor editor={editor} readonly={readonly} />;
};

const meta: Meta<typeof EditorWrapper> = {
  title: 'Modules/Workflow/Actions/SendEmail/EmailEditor',
  component: EditorWrapper,
  parameters: {
    msw: graphqlMocks,
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
    WorkspaceDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof EditorWrapper>;

export const Default: Story = {
  args: {},
};

export const WithContent: Story = {
  args: {
    defaultValue: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello ',
            },
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: 'John',
            },
            {
              type: 'text',
              text: ',',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a sample email with ',
            },
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: 'italic',
            },
            {
              type: 'text',
              text: ' and ',
            },
            {
              type: 'text',
              marks: [{ type: 'underline' }],
              text: 'underlined',
            },
            {
              type: 'text',
              text: ' text.',
            },
          ],
        },
      ],
    }),
  },
};

export const WithHeadings: Story = {
  args: {
    defaultValue: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Welcome Email' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Getting Started' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Thank you for joining us! Here are some next steps:',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Next Steps' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '1. Complete your profile' }],
        },
      ],
    }),
  },
};

export const WithLinks: Story = {
  args: {
    defaultValue: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Visit our ' },
            {
              type: 'text',
              marks: [{ type: 'link', attrs: { href: 'https://twenty.com' } }],
              text: 'website',
            },
            { type: 'text', text: ' for more information.' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Contact us at ' },
            {
              type: 'text',
              marks: [
                { type: 'link', attrs: { href: 'mailto:support@twenty.com' } },
              ],
              text: 'support@twenty.com',
            },
          ],
        },
      ],
    }),
  },
};

export const WithVariableTags: Story = {
  args: {
    defaultValue: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Dear ' },
            {
              type: 'variableTag',
              attrs: { variable: '{{firstName}}' },
            },
            { type: 'text', text: ',' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Your order ' },
            {
              type: 'variableTag',
              attrs: { variable: '{{orderNumber}}' },
            },
            { type: 'text', text: ' has been shipped!' },
          ],
        },
      ],
    }),
  },
};

export const ReadOnly: Story = {
  args: {
    readonly: true,
    defaultValue: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: 'Read-only mode',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This editor is in read-only mode and cannot be edited.',
            },
          ],
        },
      ],
    }),
  },
};

export const Empty: Story = {
  args: {
    placeholder: 'Start typing your email content...',
  },
};

export const Interactive: Story = {
  args: {
    onUpdate: fn(),
    placeholder: 'Try typing, formatting text, or uploading images...',
  },
};
