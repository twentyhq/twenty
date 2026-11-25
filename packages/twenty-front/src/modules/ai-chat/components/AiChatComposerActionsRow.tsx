import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiModelTierDropdown } from '@/ai-chat/components/AiModelTierDropdown';
import { AiChatComposerActionsRowContext } from '@/ai-chat/contexts/AiChatComposerActionsRowContext';
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
  isModelPickerHidden?: boolean;
};

export const AiChatComposerActionsRow = ({
  leftActions,
  modelTierDropdownId,
  sendButton,
  isModelPickerHidden = false,
}: AiChatComposerActionsRowProps) => {
  const aiModels = useAtomStateValue(aiModelsState);
  const [actionsRowElement, setActionsRowElement] =
    useState<HTMLDivElement | null>(null);

  return (
    <StyledActionsRow ref={setActionsRowElement}>
      <StyledLeftActions>
        <AiChatComposerActionsRowContext.Provider value={actionsRowElement}>
          {leftActions}
        </AiChatComposerActionsRowContext.Provider>
      </StyledLeftActions>
      <StyledRightActions>
        {!isModelPickerHidden && (
          <AiModelTierDropdown
            dropdownId={modelTierDropdownId}
            disabled={aiModels.length === 0}
          />
        )}
        {sendButton}
      </StyledRightActions>
    </StyledActionsRow>
  );
};
