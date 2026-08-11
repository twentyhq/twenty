import { styled } from '@linaria/react';
import { useContext } from 'react';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconList, useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconContainer = styled.span`
  display: flex;
  flex-shrink: 0;
`;

const StyledAdornments = styled.span`
  align-items: center;
  color: ${themeCssVariables.grayScale.gray8};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  margin-left: ${themeCssVariables.spacing[1]};
`;

const StyledStackName = styled.span`
  margin-left: ${themeCssVariables.spacing[1]};
  max-width: 130px;
  min-width: 0;
  overflow: hidden;
`;

const StyledCurrentViewName = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  margin-left: ${themeCssVariables.spacing[1]};
  max-width: 110px;
  min-width: 0;
  overflow: hidden;
`;

type ViewStackTabButtonProps = {
  rootView: View;
  isActive: boolean;
  isDropdownOpen?: boolean;
  activeChildView?: View;
  totalCount?: number | null;
  onClick?: () => void;
};

export const ViewStackTabButton = ({
  rootView,
  isActive,
  isDropdownOpen = false,
  activeChildView,
  totalCount,
  onClick,
}: ViewStackTabButtonProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { formatNumber } = useNumberFormat();

  const RootViewIcon = getIcon(rootView.icon);

  return (
    <StyledDropdownButtonContainer
      isUnfolded={isDropdownOpen}
      isActive={isActive}
      onClick={onClick}
    >
      <StyledIconContainer>
        {isDefined(RootViewIcon) ? (
          <RootViewIcon size={theme.icon.size.md} />
        ) : (
          <IconList size={theme.icon.size.md} />
        )}
      </StyledIconContainer>
      <StyledStackName>
        <OverflowingTextWithTooltip text={rootView.name} />
      </StyledStackName>
      {isDefined(activeChildView) && (
        <StyledCurrentViewName>
          <OverflowingTextWithTooltip text={`/ ${activeChildView.name}`} />
        </StyledCurrentViewName>
      )}
      <StyledAdornments>
        {isActive && isDefined(totalCount) && (
          <>· {formatNumber(totalCount)} </>
        )}
        {isActive && <IconChevronDown size={theme.icon.size.sm} />}
      </StyledAdornments>
    </StyledDropdownButtonContainer>
  );
};
