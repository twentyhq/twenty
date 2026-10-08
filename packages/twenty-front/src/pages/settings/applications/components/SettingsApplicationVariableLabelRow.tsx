import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconInfoCircle } from 'twenty-ui/icon';
import { Pill } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

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
  label,
  isDeprecated,
  description,
  tooltipId,
}: {
  variableKey: string;
  label?: string;
  isDeprecated: boolean;
  description: string;
  tooltipId: string;
}) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledLabelRow>
      <StyledLabel>{isNonEmptyString(label) ? label : variableKey}</StyledLabel>
      {isDeprecated && <Pill label={t`Deprecated`} />}
      {isNonEmptyString(description) && (
        <Tooltip
          content={description}
          sideOffset={5}
          side="bottom"
          positionMethod="fixed"
          delay={TooltipDelay.shortDelay}
        >
          <IconInfoCircle
            id={tooltipId}
            size={theme.icon.size.sm}
            color={theme.font.color.tertiary}
            style={{ outline: 'none', cursor: 'pointer' }}
          />
        </Tooltip>
      )}
    </StyledLabelRow>
  );
};
