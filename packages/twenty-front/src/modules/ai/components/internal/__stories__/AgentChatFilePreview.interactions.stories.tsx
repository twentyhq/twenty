import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const FILE_NAME = 'Quarterly-account-archive-and-final-contract.pdf';

const meta: Meta<typeof AgentChatFilePreview> = {
  title: 'Modules/AI/AgentChatFilePreview/Interactions',
  component: AgentChatFilePreview,
  decorators: [ComponentDecorator, ObjectMetadataItemsDecorator],
  args: {
    file: {
      type: 'file',
      filename: FILE_NAME,
      mediaType: 'application/pdf',
      url: 'https://example.com/contract.pdf',
      fileId: 'contract-file-id',
    },
    onRemove: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AgentChatFilePreview>;

const PreviewStateProbe = () => {
  const filePreview = useAtomStateValue(filePreviewState);

  return (
    <output aria-label="File preview">
      {filePreview?.label ?? 'No preview'}
    </output>
  );
};

export const TruncatedPreviewWithRemoval: Story = {
  render: (args) => (
    <>
      <Button>Before preview</Button>
      <div style={{ width: 160 }}>
        <AgentChatFilePreview {...args} />
      </div>
      <PreviewStateProbe />
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup();
    const previewButton = await canvas.findByRole('button', {
      name: FILE_NAME,
    });
    const removeButton = canvas.getByRole('button', {
      name: `Remove ${FILE_NAME}`,
    });
    const label = within(previewButton).getByText(FILE_NAME);

    expect(previewButton.querySelector('button')).toBeNull();
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await user.hover(label);
    expect(await body.findByRole('tooltip')).toHaveTextContent(FILE_NAME);
    await user.unhover(label);
    await user.click(canvas.getByRole('button', { name: 'Before preview' }));
    await user.tab();
    expect(previewButton).toHaveFocus();
    await user.tab();
    expect(removeButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(args.onRemove).toHaveBeenCalledTimes(1);
    expect(
      canvas.getByRole('status', { name: 'File preview' }),
    ).toHaveTextContent('No preview');
    await user.click(previewButton);
    expect(
      canvas.getByRole('status', { name: 'File preview' }),
    ).toHaveTextContent(FILE_NAME);
    expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};
