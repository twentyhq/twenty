import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { TabButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type ComposeEmailMode = 'TRANSACTIONAL' | 'CAMPAIGN';

const StyledTabs = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type ComposeEmailModeTabsProps = {
  activeMode: ComposeEmailMode;
  onModeChange: (mode: ComposeEmailMode) => void;
};

export const ComposeEmailModeTabs = ({
  activeMode,
  onModeChange,
}: ComposeEmailModeTabsProps) => (
  <StyledTabs>
    <TabButton
      id="compose-email-transactional"
      title={t`Transactional`}
      active={activeMode === 'TRANSACTIONAL'}
      onClick={() => onModeChange('TRANSACTIONAL')}
    />
    <TabButton
      id="compose-email-marketing"
      title={t`Marketing`}
      active={activeMode === 'CAMPAIGN'}
      onClick={() => onModeChange('CAMPAIGN')}
    />
  </StyledTabs>
);
