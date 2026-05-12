import { AppChip } from '@/applications/components/AppChip';
import { Avatar } from 'twenty-ui/display';
import { Chip, ChipAccent, ChipVariant } from 'twenty-ui/components';
import { isDefined } from 'twenty-shared/utils';

type SettingsItemTypeTagProps = {
  item: {
    isCustom?: boolean;
    isRemote?: boolean;
    applicationId?: string | null;
  };
  className?: string;
};

export const SettingsItemTypeTag = ({
  className,
  item: { isRemote, applicationId },
}: SettingsItemTypeTagProps) => {
  if (isDefined(applicationId)) {
    return <AppChip applicationId={applicationId} className={className} />;
  } else if (isRemote === true) {
    return (
      <Chip
        className={className}
        label="Remote"
        variant={ChipVariant.Transparent}
        accent={ChipAccent.TextPrimary}
        leftComponent={
          <Avatar
            type="app"
            size="sm"
            placeholder="Remote"
            placeholderColorSeed="Remote"
          />
        }
      />
    );
  } else {
    return null;
  }
};
