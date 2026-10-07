import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type RequestFormToolInput,
  type RequestFormToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconListDetails } from 'twenty-ui/icon';

import { AiChatAskStatusRow } from '@/ai/components/AiChatAskStatusRow';
import { StyledAiChatAskStatusDetail } from '@/ai/components/AiChatAskStyledComponents';

export const AiChatFormStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();

  const fields =
    (toolPart.input as Partial<RequestFormToolInput> | undefined)?.fields ?? [];
  const result = (
    toolPart.output as { result?: RequestFormToolResult } | null | undefined
  )?.result;
  const status = result?.status ?? 'pending';
  const values = result?.values ?? {};

  const messageByStatus = {
    pending: t`Waiting for a form to be filled in`,
    answered: t`Form submitted`,
    skipped: t`Form skipped`,
  };

  return (
    <AiChatAskStatusRow
      Icon={IconListDetails}
      message={messageByStatus[status]}
      isShimmering={isStreaming && status === 'pending'}
    >
      {fields
        .filter((field) => isDefined(values[field.name]))
        .map((field) => {
          const value = values[field.name];

          return (
            <StyledAiChatAskStatusDetail key={field.name}>
              {`${field.label}: ${isString(value) ? value : JSON.stringify(value)}`}
            </StyledAiChatAskStatusDetail>
          );
        })}
    </AiChatAskStatusRow>
  );
};
