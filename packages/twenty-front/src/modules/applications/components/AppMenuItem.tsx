import { AppChip } from '@/applications/components/AppChip';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { MenuItem } from 'twenty-ui/navigation';

type AppMenuItemProps = {
  applicationId?: string | null;
  text: string;
  onClick?: () => void;
  focused?: boolean;
  disabled?: boolean;
};

export const AppMenuItem = ({
  applicationId,
  text,
  onClick,
  focused,
  disabled,
}: AppMenuItemProps) => {
  const { applicationChipData } = useApplicationChipData({
    applicationId,
  });

  return (
    <MenuItem
      withIconContainer={true}
      LeftIcon={() => (
        <AppChip applicationId={applicationId} size={'md'} chipOnly />
      )}
      text={text}
      contextualText={applicationChipData.name}
      onClick={onClick}
      focused={focused}
      disabled={disabled}
    />
  );
};
