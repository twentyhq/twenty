import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getItemTagInfo } from '@/settings/data-model/utils/getItemTagInfo';
import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/display';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsItemTypeTagProps = {
  item: {
    isCustom?: boolean;
    isRemote?: boolean;
    applicationId?: string | null;
  };
  className?: string;
};

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

export const SettingsItemTypeTag = ({
  className,
  item: { isCustom, isRemote, applicationId },
}: SettingsItemTypeTagProps) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const itemTagInfo = getItemTagInfo({
    item: { isCustom, isRemote, applicationId },
    workspaceCustomApplicationId:
      currentWorkspace?.workspaceCustomApplication?.id,
  });

  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer className={className}>
      <Avatar
        placeholder={itemTagInfo.labelText}
        placeholderColorSeed={itemTagInfo.labelText}
        type="squared"
        size="xs"
        color={theme.tag.text[itemTagInfo.labelColor]}
        backgroundColor={theme.tag.background[itemTagInfo.labelColor]}
      />
      {itemTagInfo.labelText}
    </StyledContainer>
  );
};
