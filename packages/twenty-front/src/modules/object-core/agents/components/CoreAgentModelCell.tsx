import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  isAiModelEffort,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useResolvedAiModel } from '@/ai/hooks/useResolvedAiModel';
import { getAiModelEffortLabel } from '@/ai/utils/getAiModelEffortLabel';
import { getAiModelModeDescription } from '@/ai/utils/getAiModelModeDescription';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledEffort = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  white-space: nowrap;
`;

type CoreAgentModelCellProps = {
  modelId: string;
};

export const CoreAgentModelCell = ({ modelId }: CoreAgentModelCellProps) => {
  const { t } = useLingui();
  const resolvedModel = useResolvedAiModel(modelId);

  if (!isDefined(resolvedModel)) {
    return (
      <StyledContainer>
        <OverflowingTextWithTooltip
          text={
            modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
              ? t`Workspace default`
              : modelId
          }
        />
      </StyledContainer>
    );
  }

  const modelName = getAiModelModeDescription(
    { model: resolvedModel, isPinned: true },
    { showAutomatic: false, showEffort: false },
  );
  const effort = resolvedModel.effort;

  return (
    <StyledContainer>
      <OverflowingTextWithTooltip text={modelName} />
      {isDefined(effort) && isAiModelEffort(effort) && (
        <StyledEffort>{`· ${getAiModelEffortLabel(effort)}`}</StyledEffort>
      )}
    </StyledContainer>
  );
};
