import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledListContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

type SidePanelCoreAgentRoleLayoutProps = {
  roleId?: string | null;
  searchInput: ReactNode;
  children: ReactNode;
};

export const SidePanelCoreAgentRoleLayout = ({
  roleId,
  searchInput,
  children,
}: SidePanelCoreAgentRoleLayoutProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  return (
    <StyledContainer>
      {searchInput}
      <StyledListContainer>{children}</StyledListContainer>
      {isNonEmptyString(roleId) && (
        <SidePanelFooter
          actions={[
            <Button
              key="open-in-roles"
              size="sm"
              variant="outline"
              startIcon={<IconArrowUpRight />}
              onClick={() =>
                navigateSettings(SettingsPath.RoleDetail, { roleId })
              }
            >{t`Open in Roles`}</Button>,
          ]}
        />
      )}
    </StyledContainer>
  );
};
