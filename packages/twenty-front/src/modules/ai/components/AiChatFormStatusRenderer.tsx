import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type RequestFormToolInput,
  type RequestFormToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconListDetails } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import {
  StyledAiChatAskStatusContainer,
  StyledAiChatAskStatusMessage,
} from '@/ai/components/AiChatAskStyledComponents';
import { ShimmeringText } from '@/ai/components/ShimmeringText';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const StyledDetail = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

export const AiChatFormStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();
  const theme = useTheme();

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
    <StyledAiChatAskStatusContainer>
      <IconListDetails size={theme.icon.size.sm} />
      <StyledContent>
        {isStreaming && status === 'pending' ? (
          <ShimmeringText>
            <StyledAiChatAskStatusMessage>
              {messageByStatus[status]}
            </StyledAiChatAskStatusMessage>
          </ShimmeringText>
        ) : (
          <StyledAiChatAskStatusMessage>
            {messageByStatus[status]}
          </StyledAiChatAskStatusMessage>
        )}
        {fields
          .filter((field) => isDefined(values[field.name]))
          .map((field) => {
            const value = values[field.name];

            return (
              <StyledDetail key={field.name}>
                {`${field.label}: ${isString(value) ? value : JSON.stringify(value)}`}
              </StyledDetail>
            );
          })}
      </StyledContent>
    </StyledAiChatAskStatusContainer>
  );
};
