import { AppChip } from '@/applications/components/AppChip';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAppIconContainer = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  padding: ${themeCssVariables.spacing[1]};
`;

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
      startIcon={
        <StyledAppIconContainer>
          <AppChip applicationId={applicationId} size="md" chipOnly />
        </StyledAppIconContainer>
      }
      description={applicationChipData.name}
      onClick={getDropdownMenuItemClickHandler(onClick)}
      focused={focused}
      disabled={disabled}
      endIcon={RightComponent}
    >
      <OverflowingTextWithTooltip text={text} />
    </ListItem>
  );
};
