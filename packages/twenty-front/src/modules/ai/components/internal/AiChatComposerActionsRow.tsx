import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiModelTierDropdown } from '@/ai/components/AiModelTierDropdown';
import { AiChatContextUsageButton } from '@/ai/components/internal/AiChatContextUsageButton';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledActionsRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledLeftActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledRightActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type AiChatComposerActionsRowProps = {
  leftActions?: ReactNode;
  modelTierDropdownId: string;
  sendButton: ReactNode;
};

export const AiChatComposerActionsRow = ({
  leftActions,
  modelTierDropdownId,
  sendButton,
}: AiChatComposerActionsRowProps) => {
  const aiModels = useAtomStateValue(aiModelsState);

  return (
    <StyledActionsRow>
      <StyledLeftActions>
        {leftActions}
        <AiChatContextUsageButton />
      </StyledLeftActions>
      <StyledRightActions>
        <AiModelTierDropdown
          dropdownId={modelTierDropdownId}
          disabled={aiModels.length === 0}
        />
        {sendButton}
      </StyledRightActions>
    </StyledActionsRow>
  );
};
