import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { Avatar } from 'twenty-ui/display';
import {
  Chip,
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
      size="xs"
      placeholder={applicationChipData.name}
      placeholderColorSeed={applicationChipData.seed}
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
    />
  );
};
