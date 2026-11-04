import { AppChip } from '@/applications/components/AppChip';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { isDefined } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

type SettingsItemTypeTagProps = {
  item: {
    isRemote?: boolean;
    applicationId?: string | null;
  };
};

export const SettingsItemTypeTag = ({
  item: { isRemote, applicationId },
}: SettingsItemTypeTagProps) => {
  const { t } = useLingui();
  if (isDefined(applicationId)) {
    return <AppChip applicationId={applicationId} />;
  }

  if (!isRemote) {
    return null;
  }

  return (
    <Chip
      variant="plain"
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
    >{t`Remote`}</Chip>
  );
};
