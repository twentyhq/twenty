import { ListItem } from 'twenty-ui/primitives/navigation';
import { AppMenuItemIcon } from '@/applications/components/AppMenuItemIcon';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { type ReactNode } from 'react';

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
    <ListItem
      startIcon={<AppMenuItemIcon applicationId={applicationId} />}
      description={applicationChipData.name}
      onClick={onClick}
      focused={focused}
      disabled={disabled}
      endIcon={RightComponent}
    >
      {text}
    </ListItem>
  );
};
