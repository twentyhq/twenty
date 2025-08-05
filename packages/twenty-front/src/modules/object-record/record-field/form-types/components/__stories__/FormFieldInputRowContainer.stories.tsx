/* eslint-disable @nx/workspace-no-hardcoded-colors */

import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import {
  FormFieldInputRowContainer,
  LINE_HEIGHT,
} from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';

const meta: Meta<typeof FormFieldInputRowContainer> = {
  title:
    'Modules/ObjectRecord/RecordField/FormTypes/FormFieldInputRowContainer',
  component: FormFieldInputRowContainer,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'padded',
  },
  args: {
    children: (
      <div
        style={{
          padding: '8px',
          backgroundColor: 'var(--color-gray-100, #f0f0f0)',
          border: '1px dashed var(--color-gray-300, #ccc)',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        This is the content inside the FormFieldInputRowContainer. It
        demonstrates how the container behaves with different configurations.
        You can add more text here to see how it handles multiline content and
        height constraints. This text is long enough to show wrapping behavior
        when the container has height limits.
      </div>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof FormFieldInputRowContainer>;

export const SingleLine: Story = {
  args: {
    multiline: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    // Test that the component renders in single line mode
    expect(container).toBeInTheDocument();
    expect(
      canvas.getByText('Single line container with fixed height'),
    ).toBeVisible();
  },
};

export const MultilineDefault: Story = {
  args: {
    multiline: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    // Test that the component renders and has the proper structure
    expect(container).toBeInTheDocument();
    expect(
      canvas.getByText(
        'It allows unlimited text with default height constraints.',
      ),
    ).toBeVisible();
  },
};

export const MultilineWithCustomMaxHeight100: Story = {
  args: {
    multiline: true,
    maxHeight: 100,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    // Test that the component renders with custom maxHeight
    expect(container).toBeInTheDocument();
    expect(canvas.getByText('Custom max height of 100px')).toBeVisible();
  },
};

export const MultilineWithCustomMaxHeight200: Story = {
  args: {
    multiline: true,
    maxHeight: 200,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    // Test that the component renders with custom maxHeight of 200px
    expect(container).toBeInTheDocument();
    expect(canvas.getByText('Custom max height of 200px')).toBeVisible();
  },
};

export const MultilineWithSmallMaxHeight: Story = {
  args: {
    multiline: true,
    maxHeight: 60,
    children: (
      <div
        style={{
          padding: '4px',
          backgroundColor: 'var(--color-gray-100, #f0f0f0)',
          border: '1px dashed var(--color-gray-300, #ccc)',
          fontSize: '14px',
          lineHeight: '1.4',
        }}
      >
        This content will be constrained by the small max height of 60px,
        demonstrating how the container handles overflow when content is taller
        than the limit.
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    // Test that the component renders with small maxHeight
    expect(container).toBeInTheDocument();
    expect(canvas.getByText('Constrained height scenario')).toBeVisible();
  },
};

export const MultilineWithLargeMaxHeight: Story = {
  args: {
    multiline: true,
    maxHeight: 400,
    children: (
      <div
        style={{
          padding: '12px',
          backgroundColor: 'var(--color-gray-100, #f0f0f0)',
          border: '1px dashed var(--color-gray-300, #ccc)',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        This container has a large max height of 400px, giving plenty of room
        for content to expand.
        <br />
        <br />
        Line 1: This is some sample content that takes up multiple lines.
        <br />
        Line 2: The container can accommodate all of this text comfortably.
        <br />
        Line 3: Even with more content, there's still room to grow.
        <br />
        Line 4: The max height constraint won't be reached with this amount of
        text.
        <br />
        Line 5: This demonstrates how the component behaves with generous height
        limits.
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    // Test that the component renders with large maxHeight
    expect(container).toBeInTheDocument();
    expect(canvas.getByText('Large content area')).toBeVisible();
  },
};

export const SingleLineIgnoresMaxHeight: Story = {
  args: {
    multiline: false,
    maxHeight: 200, // This should be ignored in single line mode
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    // Should maintain fixed height regardless of maxHeight prop in single line mode
    expect(container).toBeInTheDocument();
    expect(canvas.getByText('Single line ignores maxHeight')).toBeVisible();
  },
};

export const MultilineWithTextarea: Story = {
  args: {
    multiline: true,
    maxHeight: 150,
    children: (
      <textarea
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          backgroundColor: 'transparent',
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: `${LINE_HEIGHT}px`,
          padding: '4px',
        }}
        placeholder="Type your multiline text here..."
        defaultValue="This is a textarea inside the FormFieldInputRowContainer.
You can type multiple lines of text here.
The container will constrain the height based on the maxHeight prop.
This demonstrates real-world usage with form inputs."
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    expect(container).toHaveStyle({
      'max-height': '150px',
    });

    const textarea = canvas.getByPlaceholderText(
      'Type your multiline text here...',
    );
    expect(textarea).toBeInTheDocument();
  },
};

export const MultilineWithScrollableContent: Story = {
  args: {
    multiline: true,
    maxHeight: 80,
    children: (
      <div
        style={{
          padding: '8px',
          backgroundColor: 'var(--color-gray-50, #f9f9f9)',
          border: '1px solid var(--color-gray-300, #ddd)',
          fontSize: '12px',
          lineHeight: '1.4',
          overflowY: 'auto',
          height: '120px', // Intentionally taller than maxHeight
        }}
      >
        <div>
          Line 1: This content is intentionally taller than the container's
          maxHeight
        </div>
        <div>Line 2: This will force the container to constrain the height</div>
        <div>Line 3: The inner content should become scrollable</div>
        <div>Line 4: You should see scrollbars when this content overflows</div>
        <div>Line 5: This demonstrates overflow handling</div>
        <div>Line 6: More content to ensure overflow</div>
        <div>Line 7: Even more content</div>
        <div>Line 8: Final line of overflow content</div>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.firstChild as HTMLElement;

    // Test that the component renders with overflow scenario
    expect(container).toBeInTheDocument();
    expect(
      canvas.getByText(
        "Line 1: This content is intentionally taller than the container's maxHeight",
      ),
    ).toBeVisible();
  },
};

export const Comparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3
          style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}
        >
          Single Line (height: 32px)
        </h3>
        <FormFieldInputRowContainer multiline={false}>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'var(--color-blue-50, #e3f2fd)',
              border: '1px solid var(--color-blue-500, #2196f3)',
            }}
          >
            Single line content
          </div>
        </FormFieldInputRowContainer>
      </div>

      <div>
        <h3
          style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}
        >
          Multiline Default (max-height: {5 * LINE_HEIGHT}px)
        </h3>
        <FormFieldInputRowContainer multiline={true}>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'var(--color-green-50, #e8f5e8)',
              border: '1px solid var(--color-green-500, #4caf50)',
            }}
          >
            Default multiline with max-height of {5 * LINE_HEIGHT}px
          </div>
        </FormFieldInputRowContainer>
      </div>

      <div>
        <h3
          style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}
        >
          Multiline Custom (max-height: 100px)
        </h3>
        <FormFieldInputRowContainer multiline={true} maxHeight={100}>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'var(--color-orange-50, #fff3e0)',
              border: '1px solid var(--color-orange-500, #ff9800)',
            }}
          >
            Custom multiline with max-height of 100px
          </div>
        </FormFieldInputRowContainer>
      </div>

      <div>
        <h3
          style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}
        >
          Multiline Large (max-height: 200px)
        </h3>
        <FormFieldInputRowContainer multiline={true} maxHeight={200}>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'var(--color-pink-50, #fce4ec)',
              border: '1px solid var(--color-pink-500, #e91e63)',
            }}
          >
            Large multiline with max-height of 200px - plenty of room for
            content
          </div>
        </FormFieldInputRowContainer>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
