import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor } from '@storybook/test';
import { isDefined } from 'twenty-shared/utils';
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
  placeholder = 'Enter text content...',
  defaultValue = null,
  onUpdate = fn(),
  minHeight = 200,
  maxWidth = 800,
  enableSlashCommand = true,
}: {
  readonly?: boolean;
  placeholder?: string;
  defaultValue?: string | null;
  onUpdate?: (content: string) => void;
  minHeight?: number;
  maxWidth?: number;
  enableSlashCommand?: boolean;
}) => {
  const editor = useAdvancedTextEditor({
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
    enableSlashCommand,
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <AdvancedTextEditor
      editor={editor}
      readonly={readonly}
      minHeight={minHeight}
      maxWidth={maxWidth}
    />
  );
};

const meta: Meta<typeof EditorWrapper> = {
  title: 'Modules/AdvancedTextEditor/AdvancedTextEditor',
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
              text: 'World',
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
              text: 'This is a sample text with ',
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
          content: [{ type: 'text', text: 'Main Title' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Subtitle' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a paragraph with some content.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Smaller Heading' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Another paragraph here.' }],
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
            { type: 'text', text: ' has been processed!' },
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
    placeholder: 'Start typing your content...',
  },
};

export const Interactive: Story = {
  args: {
    onUpdate: fn(),
    placeholder: 'Try typing, formatting text, or uploading images...',
  },
};

export const CustomSize: Story = {
  args: {
    minHeight: 300,
    maxWidth: 600,
    placeholder: 'This editor has custom dimensions...',
  },
};

export const WithLists: Story = {
  args: {
    defaultValue: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Project Requirements' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'User authentication system' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Database integration' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'API endpoints' }],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Implementation Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Set up development environment' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Create database schema' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Implement authentication' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Build API endpoints' }],
                },
              ],
            },
          ],
        },
      ],
    }),
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify bullet list is rendered', async () => {
      await waitFor(() =>
        expect(canvasElement.querySelectorAll('ul li').length).toBeGreaterThan(
          0,
        ),
      );

      const listItems = canvasElement.querySelectorAll('ul li');

      const firstItem = listItems[0];
      expect(firstItem).toBeInTheDocument();
      expect(firstItem).toHaveTextContent(/User authentication system/i);
    });

    await step('Verify ordered list is rendered', async () => {
      await waitFor(() =>
        expect(canvasElement.querySelectorAll('ol li').length).toBeGreaterThan(
          0,
        ),
      );

      const orderedListItems = canvasElement.querySelectorAll('ol li');

      const firstOrderedItem = orderedListItems[0];
      expect(firstOrderedItem).toBeInTheDocument();
      expect(firstOrderedItem).toHaveTextContent(
        /Set up development environment/i,
      );
    });

    await step('Test list interaction', async () => {
      const editorContent = canvasElement.querySelector('.tiptap');
      expect(editorContent).toBeInTheDocument();

      const firstListItem = canvasElement.querySelector('ul li');
      if (isDefined(firstListItem)) {
        await userEvent.click(firstListItem);

        expect(editorContent).toHaveFocus();
      }
    });

    await step('Verify list structure', async () => {
      const bulletList = canvasElement.querySelector('ul');
      expect(bulletList).toBeInTheDocument();

      const orderedList = canvasElement.querySelector('ol');
      expect(orderedList).toBeInTheDocument();

      await waitFor(() =>
        expect(canvasElement.querySelectorAll('ul li').length).toBe(3),
      );

      await waitFor(() =>
        expect(canvasElement.querySelectorAll('ol li').length).toBe(4),
      );
    });
  },
};
