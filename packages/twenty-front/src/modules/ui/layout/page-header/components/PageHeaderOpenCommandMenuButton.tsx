import {
  Button,
  IconButton,
  IconDotsVertical,
  IconX,
  getOsControlSymbol,
  useIsMobile,
} from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledButtonWrapper = styled.div`
  z-index: 30;
`;

export const PageHeaderOpenCommandMenuButton = () => {
  const { toggleCommandMenu } = useCommandMenu();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const isMobile = useIsMobile();

  const ariaLabel = isCommandMenuOpened
    ? t`Close command menu`
    : t`Open command menu`;

  const Icon = isCommandMenuOpened ? IconX : IconDotsVertical;

  return (
    <StyledButtonWrapper>
      {isCommandMenuV2Enabled ? (
        <Button
          Icon={Icon}
          className="page-header-command-menu-button"
          dataTestId="page-header-command-menu-button"
          size={isMobile ? 'medium' : 'small'}
          variant="secondary"
          accent="default"
          hotkeys={[getOsControlSymbol(), 'K']}
          ariaLabel={ariaLabel}
          onClick={toggleCommandMenu}
        />
      ) : (
        <IconButton
          Icon={Icon}
          size="medium"
          dataTestId="command-menu-button"
          accent="default"
          variant="secondary"
          onClick={toggleCommandMenu}
        />
      )}
    </StyledButtonWrapper>
  );
};
