import { SelectOptionDescriptionTooltip } from '@/ui/input/components/SelectOptionDescriptionTooltip';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { IconCheck, IconInfoCircle } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

type SettingsDataModelFieldSelectFormOptionLabelIconsProps = {
  description?: string | null;
  isDefault?: boolean;
};

const StyledIconsContainer = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const SettingsDataModelFieldSelectFormOptionLabelIcons = ({
  description,
  isDefault,
}: SettingsDataModelFieldSelectFormOptionLabelIconsProps) => {
  const theme = useTheme();

  return (
    <StyledIconsContainer>
      {isNonEmptyString(description?.trim()) && (
        <SelectOptionDescriptionTooltip description={description} side="top">
          <IconInfoCircle size={theme.icon.size.md} />
        </SelectOptionDescriptionTooltip>
      )}
      {isDefault && <IconCheck size={theme.icon.size.md} />}
    </StyledIconsContainer>
  );
};
