import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { AiModelTierDropdown } from '@/ai/components/AiModelTierDropdown';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import {
  FileFolder,
  SendChatMessageDocument,
  type FileAttachmentInput,
} from '~/generated-metadata/graphql';
import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { v4 } from 'uuid';
import { Button } from 'twenty-ui/primitives/input';
import { IconArrowUp, IconPlus, IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useToast } from 'twenty-ui/components/feedback';
import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useGettingStarted } from '@/getting-started/hooks/useGettingStarted';
import {
  StyledGettingStartedColumn,
  StyledGettingStartedRow,
} from '@/getting-started/components/GettingStartedStyles';

const StyledComposer = styled.textarea`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font: inherit;
  min-height: 80px;
  padding: 12px;
  resize: vertical;
  width: 100%;
`;

export const GettingStartedFollowUpAction = () => {
  const { t } = useLingui();
  const [prompt, setPrompt] = useState(
    t`Every Monday, draft a follow-up email for each deal closing in the next 30 days.`,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<FileAttachmentInput[]>([]);
  const [uploading, setUploading] = useState(false);
  const { uploadFile } = useDirectFileUpload();
  const { modelIdForRequest } = useAgentChatModelId();
  const [request] = useState(() => ({ threadId: v4(), messageId: v4() }));
  const [send, { loading }] = useMutation(SendChatMessageDocument);
  const { completeStep } = useGettingStarted();
  const { openAskAiThread } = useOpenAskAiThread();
  const { enqueueToast } = useToast();
  const attach = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadFile(file, {
          fileFolder: FileFolder.AgentChat,
        });
        setAttachments((previous) => [
          ...previous,
          { id: uploaded.id, filename: file.name },
        ]);
      }
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Could not attach the file. Please try again.`,
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };
  const submit = async () => {
    if (!prompt.trim() || loading || uploading) return;
    try {
      const result = await send({
        variables: {
          ...request,
          text: prompt.trim(),
          fileAttachments: attachments,
          modelId: modelIdForRequest,
        },
      });
      if (!result.data?.sendChatMessage.messageId) return;
      await completeStep('followUpDeals');
      openAskAiThread(request.threadId);
    } catch (error) {
      enqueueToast({
        status: 'error',
        children:
          error instanceof Error
            ? error.message
            : t`Could not send the follow-up request.`,
      });
    }
  };
  return (
    <StyledGettingStartedColumn>
      <StyledComposer
        aria-label={t`Follow-up instructions`}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        onChange={(event) => void attach(event.target.files)}
      />
      {attachments.map((file) => (
        <StyledGettingStartedRow key={file.id}>
          <span>{file.filename}</span>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t`Remove ${file.filename}`}
            onClick={() =>
              setAttachments((previous) =>
                previous.filter((attachment) => attachment.id !== file.id),
              )
            }
          >
            <IconX size={12} />
          </Button>
        </StyledGettingStartedRow>
      ))}
      <StyledGettingStartedRow style={{ justifyContent: 'space-between' }}>
        <Button
          size="sm"
          variant="ghost"
          aria-label={t`Attach files`}
          loading={uploading}
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          <IconPlus size={14} />
        </Button>
        <StyledGettingStartedRow>
          <AiModelTierDropdown
            dropdownId="getting-started-follow-up-model"
            disabled={loading}
          />
          <Button
            size="sm"
            variant="solid"
            color="accent"
            aria-label={t`Send follow-up instructions`}
            loading={loading}
            disabled={!prompt.trim() || uploading}
            onClick={() => void submit()}
          >
            <IconArrowUp size={14} />
          </Button>
        </StyledGettingStartedRow>
      </StyledGettingStartedRow>
    </StyledGettingStartedColumn>
  );
};
