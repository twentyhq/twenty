import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Avatar } from 'twenty-ui/data-display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { USAGE_LIMIT_SPENDER_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitSpenderTypeIcons';
import { type UsageLimitRow } from '@/settings/billing/types/UsageLimitRow';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledIcon = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsBillingLimitSpenderCellProps = {
  row: UsageLimitRow;
};

export const SettingsBillingLimitSpenderCell = ({
  row,
}: SettingsBillingLimitSpenderCellProps) => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isWorkspaceWide = row.spenderType === 'workspace';
  const name = row.spenderName;

  const SpenderIcon = isKeyOfRecord(
    USAGE_LIMIT_SPENDER_TYPE_ICONS,
    row.spenderType,
  )
    ? USAGE_LIMIT_SPENDER_TYPE_ICONS[row.spenderType]
    : undefined;

  const renderVisual = () => {
    if (isWorkspaceWide) {
      return (
        <Avatar
          placeholder={name}
          avatarUrl={getAbsoluteImageUrl(
            currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
          )}
          type="squared"
          size="md"
        />
      );
    }

    if (row.spenderType === 'userWorkspace') {
      return (
        <Avatar
          placeholder={name}
          avatarUrl={row.spenderAvatarUrl}
          type="rounded"
          size="md"
        />
      );
    }

    if (row.spenderType === 'application') {
      return (
        <Avatar
          placeholder={name}
          avatarUrl={row.spenderAvatarUrl}
          type="squared"
          size="md"
        />
      );
    }

    return (
      <StyledIcon>
        {SpenderIcon && (
          <SpenderIcon
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
      </StyledIcon>
    );
  };

  return (
    <StyledContainer>
      {renderVisual()}
      <StyledName>{name}</StyledName>
    </StyledContainer>
  );
};
