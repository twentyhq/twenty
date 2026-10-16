import { t } from '@lingui/core/macro';

import { AppChip } from '@/applications/components/AppChip';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { isDefined } from 'twenty-shared/utils';

type SettingsItemTypeTagProps = {
  item: {
    isRemote?: boolean;
    applicationId?: string | null;
  };
};

export const SettingsItemTypeTag = ({
  item: { isRemote, applicationId },
}: SettingsItemTypeTagProps) => {
  if (isDefined(applicationId)) {
    return <AppChip applicationId={applicationId} />;
  } else if (isRemote === true) {
    return (
      <Chip
        variant="ghost"
        color="primary"
        startElement={
          <Avatar
            shape="square"
            variant="outline"
            size="sm"
            name={t`Remote`}
            colorSeed="Remote"
          />
        }
        style={{ paddingInlineStart: 0 }}
      >{t`Remote`}</Chip>
    );
  } else {
    return null;
  }
};
