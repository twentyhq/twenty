import { isDefined } from 'twenty-shared/utils';
import {
  Avatar,
  IconCode,
  IconDatabase,
  IconPlayerPlay,
  IconSettings,
  IconTable,
  useIcons,
} from 'twenty-ui/display';

type ApplicationInfo = {
  name: string;
};

type MarketplaceAppInfo = {
  icon: string;
  logo?: string | null;
};

type SettingsToolIconProps = {
  kind: 'system' | 'custom';
  category?: string;
  application?: ApplicationInfo;
  marketplaceApp?: MarketplaceAppInfo;
};

const getSystemCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'database':
      return IconDatabase;
    case 'workflow':
      return IconPlayerPlay;
    case 'metadata':
      return IconSettings;
    case 'view':
      return IconTable;
    default:
      return IconCode;
  }
};

export const SettingsToolIcon = ({
  kind,
  category,
  application,
  marketplaceApp,
}: SettingsToolIconProps) => {
  const { getIcon } = useIcons();

  if (kind === 'system') {
    const CategoryIcon = getSystemCategoryIcon(category ?? '');
    return <CategoryIcon size={16} />;
  }

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

  return <IconCode size={16} />;
};
