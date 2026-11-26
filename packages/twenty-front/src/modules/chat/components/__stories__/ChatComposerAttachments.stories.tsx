import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { type ExtendedFileUIPart } from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ChatComposerAttachments } from '@/chat/components/ChatComposerAttachments';
import { ChatFilePreview } from '@/chat/components/ChatFilePreview';
import { StyledChatComposerBox } from '@/chat/components/StyledChatComposerBox';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const ATTACHMENTS: ExtendedFileUIPart[] = [
  {
    type: 'file',
    filename: 'Pets.csv',
    mediaType: 'text/csv',
    url: 'https://example.com/pets.csv',
    fileId: 'pets-file-id',
  },
  {
    type: 'file',
    filename: 'Contract.pdf',
    mediaType: 'application/pdf',
    url: 'https://example.com/contract.pdf',
    fileId: 'contract-file-id',
  },
];

const ChatComposerAttachmentsDemo = ({
  initialAttachments,
}: {
  initialAttachments: ExtendedFileUIPart[];
}) => {
  const [attachments, setAttachments] = useState(initialAttachments);

  return (
    <StyledChatComposerBox>
      <ChatComposerAttachments hasAttachments={attachments.length > 0}>
        {attachments.map((attachment) => (
          <ChatFilePreview
            key={attachment.fileId}
            file={attachment}
            onRemove={() =>
              setAttachments((currentAttachments) =>
                currentAttachments.filter(
                  (currentAttachment) => currentAttachment !== attachment,
                ),
              )
            }
          />
        ))}
      </ChatComposerAttachments>
      <span>Write a message</span>
    </StyledChatComposerBox>
  );
};

const meta: Meta<typeof ChatComposerAttachments> = {
  title: 'Modules/Chat/ChatComposerAttachments',
  component: ChatComposerAttachments,
  decorators: [ComponentDecorator, ObjectMetadataItemsDecorator],
};

export default meta;
type Story = StoryObj<typeof ChatComposerAttachments>;

export const WithAttachments: Story = {
  render: () => (
    <ChatComposerAttachmentsDemo initialAttachments={ATTACHMENTS} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Remove Pets.csv' }),
    );

    await expect(
      canvas.queryByRole('button', { name: 'Pets.csv' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Contract.pdf' }),
    ).toBeVisible();
  },
};

export const Empty: Story = {
  render: () => <ChatComposerAttachmentsDemo initialAttachments={[]} />,
};
