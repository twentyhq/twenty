import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconFolder } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[8]};
  text-align: center;
`;

export const SettingsMessageFoldersEmptyStateCard = () => {
  return (
    <Section>
      <StyledEmptyState>
        <IconFolder
          size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
        />
        <div>{t`No folders found for this account`}</div>
      </StyledEmptyState>
    </Section>
  );
};
