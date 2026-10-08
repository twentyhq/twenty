import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useResolvedAiModel } from '@/ai/hooks/useResolvedAiModel';

const StyledContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  min-width: 0;
  overflow: hidden;
`;

type CoreAgentModelCellProps = {
  modelId: string;
};

export const CoreAgentModelCell = ({ modelId }: CoreAgentModelCellProps) => {
  const { t } = useLingui();
  const resolvedModel = useResolvedAiModel(modelId);

  const fallbackLabel =
    modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
      ? t`Workspace default`
      : modelId;

  return (
    <StyledContainer>
      <OverflowingTextWithTooltip
        text={resolvedModel?.label ?? fallbackLabel}
      />
    </StyledContainer>
  );
};
