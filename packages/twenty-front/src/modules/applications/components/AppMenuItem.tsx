import { AppChip } from '@/applications/components/AppChip';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { type ReactNode } from 'react';
import { MenuItem } from 'twenty-ui/navigation';

type AppMenuItemProps = {
  applicationId?: string | null;
  text: string;
  onClick?: () => void;
  focused?: boolean;
  disabled?: boolean;
  RightComponent?: ReactNode;
};

export const AppMenuItem = ({
  applicationId,
  text,
  onClick,
  focused,
  disabled,
  RightComponent,
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
      RightComponent={RightComponent}
    />
  );
};
