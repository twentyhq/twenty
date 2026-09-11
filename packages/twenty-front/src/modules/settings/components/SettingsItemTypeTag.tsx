import { t } from '@lingui/core/macro';

import { AppChip } from '@/applications/components/AppChip';
import { Avatar, Chip } from 'twenty-ui/data-display';
import { isDefined } from 'twenty-shared/utils';

type SettingsItemTypeTagProps = {
  item: {
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
        variant="ghost"
        color="primary"
        startElement={
          <Avatar
            shape="square"
            variant="outline"
            size="sm"
            name="Remote"
            colorSeed="Remote"
          />
        }
        style={{ paddingInlineStart: 0 }}
        clickable={false}
      >{t`Remote`}</Chip>
    );
  } else {
    return null;
  }
};
