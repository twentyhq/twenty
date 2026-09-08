import { useId } from 'react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconBox, IconServer } from 'twenty-ui/icon';
import { AppTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type AiModelSummary } from '@/settings/ai/types/AiModelSummary';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledSection = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  justify-content: space-between;
`;

const StyledLabel = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledValue = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
`;

type SettingsAiModelInformationProps = { model: AiModelSummary };

export const SettingsAiModelInformation = ({
  model,
}: SettingsAiModelInformationProps) => {
  const tooltipId = useId().replace(/:/g, '');
  const serverLocation = model.dataResidency;
  const hasServerLocation = isNonEmptyString(serverLocation);

  return (
    <StyledSection>
      {hasServerLocation && (
        <StyledRow>
          <StyledLabel>
            <IconServer size={14} />
            {t`Server location`}
          </StyledLabel>
          <StyledValue id={`${tooltipId}-server-location`} tabIndex={0}>
            {serverLocation.toUpperCase()}
          </StyledValue>
          <AppTooltip
            anchorSelect={`#${tooltipId}-server-location`}
            title={t`Region where the model is hosted`}
          />
        </StyledRow>
      )}
      <StyledRow>
        <StyledLabel>
          <IconBox size={14} />
          {t`Context window`}
        </StyledLabel>
        <StyledValue id={`${tooltipId}-context`} tabIndex={0}>
          {isDefined(model.contextWindowTokens) && model.contextWindowTokens > 0
            ? formatNumber(model.contextWindowTokens, {
                abbreviate: true,
              }).replace(/k$/, 'K')
            : t`Unknown`}
        </StyledValue>
        <AppTooltip
          anchorSelect={`#${tooltipId}-context`}
          title={t`Maximum context size in tokens`}
        />
      </StyledRow>
    </StyledSection>
  );
};
