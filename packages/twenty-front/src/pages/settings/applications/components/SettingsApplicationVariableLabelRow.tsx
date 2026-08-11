import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { Pill } from 'twenty-ui/data-display';
import { IconInfoCircle } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLabelRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

export const SettingsApplicationVariableLabelRow = ({
  variableKey,
  isDeprecated,
  description,
  tooltipId,
}: {
  variableKey: string;
  isDeprecated: boolean;
  description: string;
  tooltipId: string;
}) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  return (
    <StyledLabelRow>
      <StyledLabel>{variableKey}</StyledLabel>
      {isDeprecated && <Pill label={t`Deprecated`} />}
      {isNonEmptyString(description) && (
        <>
          <IconInfoCircle
            id={tooltipId}
            size={theme.icon.size.sm}
            color={theme.font.color.tertiary}
            style={{ outline: 'none', cursor: 'pointer' }}
          />
          <AppTooltip
            anchorSelect={`#${tooltipId}`}
            content={description}
            offset={5}
            noArrow
            place="bottom"
            positionStrategy="fixed"
            delay={TooltipDelay.shortDelay}
          />
        </>
      )}
    </StyledLabelRow>
  );
};
