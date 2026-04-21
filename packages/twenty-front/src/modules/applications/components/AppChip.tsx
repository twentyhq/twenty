import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/display';
import {
  Chip,
  ChipAccent,
  type ChipSize,
  ChipVariant,
  LinkChip,
} from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AppChipProps = {
  applicationId: string;
  variant?: ChipVariant;
  size?: ChipSize;
  to?: string;
  className?: string;
};

const StyledChip = styled(Chip)`
  && {
    color: ${themeCssVariables.font.color.secondary};
    font-size: ${themeCssVariables.font.size.sm};
    font-weight: ${themeCssVariables.font.weight.regular};
  }
`;

const StyledLinkChip = styled(LinkChip)`
  && {
    color: ${themeCssVariables.font.color.secondary};
    font-size: ${themeCssVariables.font.size.sm};
    font-weight: ${themeCssVariables.font.weight.regular};
  }
`;

export const AppChip = ({
  applicationId,
  variant,
  size,
  to,
  className,
}: AppChipProps) => {
  const { applicationChipData } = useApplicationChipData({ applicationId });

  const leftComponent = (
    <Avatar
      type="app"
      size="md"
      placeholder={applicationChipData.name}
      placeholderColorSeed={applicationChipData.seed}
      color={applicationChipData.colors?.color}
      backgroundColor={applicationChipData.colors?.backgroundColor}
      borderColor={applicationChipData.colors?.borderColor}
    />
  );

  if (to) {
    return (
      <StyledLinkChip
        className={className}
        label={applicationChipData.name}
        leftComponent={leftComponent}
        size={size}
        variant={variant ?? ChipVariant.Highlighted}
        accent={ChipAccent.TextSecondary}
        to={to}
      />
    );
  }

  return (
    <StyledChip
      className={className}
      label={applicationChipData.name}
      leftComponent={leftComponent}
      size={size}
      variant={variant ?? ChipVariant.Transparent}
      accent={ChipAccent.TextSecondary}
    />
  );
};
