import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatThreadRequest } from '@/ai/types/AiChatThreadRequest';

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

type AiChatThreadRequestActionsProps = {
  request: AiChatThreadRequest;
  disabled?: boolean;
  isLoading?: boolean;
};

export const AiChatThreadRequestActions = ({
  request,
  disabled = false,
  isLoading = false,
}: AiChatThreadRequestActionsProps) => {
  const { t } = useLingui();

  return (
    <StyledActions
      role="group"
      aria-label={t`Respond to request`}
      aria-busy={isLoading}
    >
      {request.type === 'choices' &&
        request.choices.map((choice) => (
          <Button
            key={choice.id}
            size="sm"
            variant="outline"
            startIcon={choice.avatar}
            disabled={disabled || isLoading}
            onClick={(event) => {
              event.stopPropagation();
              request.onChoose(choice.id);
            }}
          >
            {choice.label}
          </Button>
        ))}
      {request.type === 'review' && (
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          loading={isLoading}
          onClick={(event) => {
            event.stopPropagation();
            request.onReview();
          }}
        >
          {request.label}
        </Button>
      )}
      {request.type === 'reply' && (
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          loading={isLoading}
          onClick={(event) => {
            event.stopPropagation();
            request.onReply();
          }}
        >
          {t`Reply`}
        </Button>
      )}
    </StyledActions>
  );
};
