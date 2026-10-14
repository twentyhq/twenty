import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ComponentProps, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconLayoutSidebarRightCollapse } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { LOG_CONSOLE_NARROW_BODY_MAX_WIDTH } from '@/log-console/constants/LogConsoleNarrowBodyMaxWidth';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';

const StyledPanel = styled.aside`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  @container log-console-body (max-width: ${LOG_CONSOLE_NARROW_BODY_MAX_WIDTH}px) {
    border-left: none;
    inset: 0;
    position: absolute;
    width: 100%;
  }
`;

const StyledTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.betweenSiblingsGap};
  height: ${APP_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledIdentifier = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

type LogConsoleDetailPanelLayoutProps = {
  title: string;
  icon: ReactNode;
  avatar?: ComponentProps<typeof HeaderIdentifier>['avatar'];
  actions?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
};

export const LogConsoleDetailPanelLayout = ({
  title,
  icon,
  avatar,
  actions,
  onClose,
  children,
}: LogConsoleDetailPanelLayoutProps) => {
  const { t } = useLingui();

  const closeLabel = t`Close details`;

  return (
    <StyledPanel>
      <StyledTopBar>
        {isDefined(onClose) && (
          <IconButton
            size="sm"
            variant="ghost"
            tooltip={closeLabel}
            aria-label={closeLabel}
            onClick={onClose}
          >
            <IconLayoutSidebarRightCollapse />
          </IconButton>
        )}
        <StyledIdentifier>
          <HeaderIdentifier
            avatar={avatar}
            icon={icon}
            iconColor={themeCssVariables.font.color.tertiary}
            title={title}
          />
        </StyledIdentifier>
        {isDefined(actions) && <StyledActions>{actions}</StyledActions>}
      </StyledTopBar>
      <StyledContent>{children}</StyledContent>
    </StyledPanel>
  );
};
