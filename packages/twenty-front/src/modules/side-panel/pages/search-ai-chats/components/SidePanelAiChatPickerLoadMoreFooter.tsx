import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { SidePanelAiChatPickerSkeleton } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSkeleton';

const CHAT_PICKER_PAGINATION_SKELETON_ROW_COUNT = 3;

const StyledFooter = styled.div`
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SidePanelAiChatPickerLoadMoreFooterProps = {
  isLoadingMore: boolean;
  children: ReactNode;
};

export const SidePanelAiChatPickerLoadMoreFooter = ({
  isLoadingMore,
  children,
}: SidePanelAiChatPickerLoadMoreFooterProps) => {
  const { t } = useLingui();

  return (
    <StyledFooter onMouseDown={(event) => event.preventDefault()}>
      {isLoadingMore ? (
        <SidePanelAiChatPickerSkeleton
          label={t`Loading more chats...`}
          rowCount={CHAT_PICKER_PAGINATION_SKELETON_ROW_COUNT}
        />
      ) : (
        children
      )}
    </StyledFooter>
  );
};
