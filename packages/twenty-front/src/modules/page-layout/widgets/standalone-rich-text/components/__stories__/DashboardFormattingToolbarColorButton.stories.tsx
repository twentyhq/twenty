import { useCreateBlockNote } from '@blocknote/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { DashboardsBlockEditor } from '@/page-layout/widgets/standalone-rich-text/components/DashboardsBlockEditor';
import { DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';

const ColorToolbarExample = () => {
  const editor = useCreateBlockNote({
    schema: DASHBOARD_BLOCK_SCHEMA,
    initialContent: [{ type: 'paragraph', content: 'Color this text' }],
  });
  return <DashboardsBlockEditor editor={editor} />;
};

const meta: Meta<typeof ColorToolbarExample> = {
  title: 'Modules/PageLayout/DashboardFormattingToolbarColorButton',
  component: ColorToolbarExample,
  decorators: [ComponentDecorator],
};
export default meta;
type Story = StoryObj<typeof ColorToolbarExample>;

export const ApplyColors: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const editor = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    )!;
    await userEvent.tripleClick(within(editor).getByText('Color this text'));
    const selectedText = canvasElement.ownerDocument.getSelection()?.toString();
    await expect(selectedText).not.toBe('');
    await userEvent.click(
      await body.findByRole('button', { name: 'Text and background colors' }),
    );
    const popup = await body.findByRole('dialog', {
      name: 'Text and background colors',
    });
    await expect(popup).toHaveClass('bn-ui-container');
    await expect(within(popup).getByText('Text Colors')).toBeVisible();
    await expect(within(popup).getByText('Background Colors')).toBeVisible();
    await expect(
      within(popup).getAllByRole('button', { name: 'Default' })[0],
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(
      within(popup).getAllByRole('button', { name: 'Red' })[0],
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(editor).toHaveFocus());
    await expect(
      editor.querySelector('[data-style-type="textColor"][data-value="red"]'),
    ).toHaveTextContent(selectedText!);
    await userEvent.click(
      await body.findByRole('button', { name: 'Text and background colors' }),
    );
    const reopened = await body.findByRole('dialog');
    await expect(
      within(reopened).getAllByRole('button', { name: 'Red' })[0],
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(
      within(reopened).getAllByRole('button', { name: 'Blue' })[1],
    );
    await waitFor(() => expect(editor).toHaveFocus());
    await expect(
      editor.querySelector(
        '[data-style-type="backgroundColor"][data-value="blue"]',
      ),
    ).toHaveTextContent(selectedText!);
    await expect(
      await body.findByRole('button', { name: 'Text and background colors' }),
    ).toBeVisible();
  },
};
