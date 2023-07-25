import { useTheme } from '@emotion/react';

import {
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
} from '@/ui/chip/components/Chip';
import { IconPhone } from '@/ui/icon';
import { Activity } from '~/generated/graphql';

type OwnProps = {
  activity: Pick<Activity, 'type'>;
};

export function ActivityTypeDropdown({ activity }: OwnProps) {
  const theme = useTheme();
  return (
    <Chip
      label={activity.type}
      leftComponent={<IconPhone size={theme.icon.size.md} />}
      size={ChipSize.Large}
      accent={ChipAccent.TextSecondary}
      variant={ChipVariant.Highlighted}
    />
  );
}
