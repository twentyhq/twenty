import { styled } from '@linaria/react';
import { useContext } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { isDefined } from 'twenty-shared/utils';
import {
  Avatar,
  getIconTileColorShades,
  IconCode,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  useIcons,
  type IconComponent,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type ApplicationInfo = {
  name: string;
};

type MarketplaceAppInfo = {
  icon: string;
  logo?: string | null;
};

type SettingsToolIconProps = {
  icon?: string | null;
  toolName?: string;
  objectName?: string;
  application?: ApplicationInfo;
  marketplaceApp?: MarketplaceAppInfo;
};

const getOperationIcon = (toolName: string): IconComponent | null => {
  if (toolName.startsWith('create_')) return IconPlus;
  if (toolName.startsWith('update_')) return IconEdit;
  if (toolName.startsWith('delete_')) return IconTrash;
  if (toolName.startsWith('find_') || toolName.startsWith('get_'))
    return IconSearch;

  return null;
};

const StyledCompositeContainer = styled.div`
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  position: relative;
  width: 16px;
`;

const StyledMainIconWrapper = styled.div<{
  $backgroundColor: string;
  $borderColor?: string;
}>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: ${({ $borderColor }) =>
    $borderColor ? `1px solid ${$borderColor}` : 'none'};
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

const StyledOperationOverlay = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.grayScale.gray4};
  border-radius: 4px;
  bottom: -5px;
  display: flex;
  height: 14px;
  justify-content: center;
  position: absolute;
  right: -6px;
  width: 12px;
`;

export const SettingsToolIcon = ({
  icon,
  toolName,
  objectName,
  application,
  marketplaceApp,
}: SettingsToolIconProps) => {
  const { getIcon } = useIcons();
  const { theme } = useContext(ThemeContext);
  const { objectMetadataItems } = useObjectMetadataItems();

  // Custom tools: application/marketplace icons
  if (isDefined(application) && isDefined(marketplaceApp?.logo)) {
    return (
      <Avatar
        avatarUrl={marketplaceApp?.logo ?? null}
        placeholder={application.name}
        placeholderColorSeed={application.name}
        type="squared"
        size="xs"
      />
    );
  }

  if (isDefined(marketplaceApp)) {
    const MarketplaceIcon = getIcon(marketplaceApp.icon);
    return <MarketplaceIcon size={16} />;
  }

  if (isDefined(application)) {
    return (
      <Avatar
        placeholder={application.name}
        placeholderColorSeed={application.name}
        type="squared"
        size="xs"
      />
    );
  }

  // System tools: icon from server, color derived from object metadata
  const MainIcon = isDefined(icon) ? getIcon(icon) : IconCode;
  const OperationIcon = isDefined(toolName) ? getOperationIcon(toolName) : null;

  const objectMetadata = isDefined(objectName)
    ? objectMetadataItems.find((item) => item.nameSingular === objectName)
    : undefined;

  const objectStyle = isDefined(objectMetadata)
    ? getIconTileColorShades(getObjectColorWithFallback(objectMetadata))
    : null;

  if (isDefined(OperationIcon)) {
    return (
      <StyledCompositeContainer>
        <StyledMainIconWrapper
          $backgroundColor={objectStyle?.backgroundColor ?? 'transparent'}
          $borderColor={objectStyle?.borderColor}
        >
          <MainIcon
            size="14px"
            stroke={theme.icon.stroke.md}
            color={objectStyle?.iconColor ?? theme.font.color.secondary}
          />
        </StyledMainIconWrapper>
        <StyledOperationOverlay>
          <OperationIcon
            size="12px"
            stroke={theme.icon.stroke.md}
            color={themeCssVariables.grayScale.gray10}
          />
        </StyledOperationOverlay>
      </StyledCompositeContainer>
    );
  }

  if (isDefined(objectStyle)) {
    return (
      <StyledCompositeContainer>
        <StyledMainIconWrapper
          $backgroundColor={objectStyle.backgroundColor}
          $borderColor={objectStyle.borderColor}
        >
          <MainIcon
            size="14px"
            stroke={theme.icon.stroke.md}
            color={objectStyle.iconColor}
          />
        </StyledMainIconWrapper>
      </StyledCompositeContainer>
    );
  }

  return <MainIcon size={16} />;
};
