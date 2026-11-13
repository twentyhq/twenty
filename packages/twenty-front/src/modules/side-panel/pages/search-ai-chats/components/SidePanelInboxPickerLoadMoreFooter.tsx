import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { SidePanelInboxPickerSkeleton } from '@/side-panel/pages/search-ai-chats/components/SidePanelInboxPickerSkeleton';

const CHAT_PICKER_PAGINATION_SKELETON_ROW_COUNT = 3;

const StyledFooter = styled.div`
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SidePanelInboxPickerLoadMoreFooterProps = {
  isLoadingMore: boolean;
  children: ReactNode;
};

export const SidePanelInboxPickerLoadMoreFooter = ({
  isLoadingMore,
  children,
}: SidePanelInboxPickerLoadMoreFooterProps) => {
  const { t } = useLingui();

  return (
    <StyledFooter onMouseDown={(event) => event.preventDefault()}>
      {isLoadingMore ? (
        <SidePanelInboxPickerSkeleton
          label={t`Loading more chats...`}
          rowCount={CHAT_PICKER_PAGINATION_SKELETON_ROW_COUNT}
        />
      ) : (
        children
      )}
    </StyledFooter>
  );
};
