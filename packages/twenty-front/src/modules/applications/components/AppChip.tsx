import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { Avatar } from 'twenty-ui/display';
import {
  Chip,
  ChipAccent,
  type ChipSize,
  ChipVariant,
  LinkChip,
} from 'twenty-ui/components';

type AppChipProps = {
  applicationId: string;
  variant?: ChipVariant;
  size?: ChipSize;
  to?: string;
  className?: string;
};

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
      <LinkChip
        className={className}
        label={applicationChipData.name}
        leftComponent={leftComponent}
        size={size}
        variant={variant ?? ChipVariant.Highlighted}
        accent={ChipAccent.TextPrimary}
        to={to}
      />
    );
  }

  return (
    <Chip
      className={className}
      label={applicationChipData.name}
      leftComponent={leftComponent}
      size={size}
      variant={variant ?? ChipVariant.Transparent}
      accent={ChipAccent.TextPrimary}
    />
  );
};
