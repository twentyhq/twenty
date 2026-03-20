import { Link, useNavigate } from 'react-router-dom';

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconPlug, Status } from 'twenty-ui/display';

import { type AiProviderItem } from '@/settings/admin-panel/ai/types/AiProviderItem';
import { getProviderIcon } from '@/settings/admin-panel/ai/utils/getProviderIcon';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';

const StyledLinkContainer = styled.div`
  > a {
    text-decoration: none;
  }
`;

type SettingsAdminAiProviderListCardProps = {
  providers: AiProviderItem[];
  isLoading?: boolean;
  showAddButton?: boolean;
};

const getProviderDescription = (provider: AiProviderItem): string => {
  const parts: string[] = [];

  if (provider.region) {
    parts.push(provider.region);
  }

  if (provider.baseUrl) {
    parts.push(provider.baseUrl);
  }

  if (provider.apiKey) {
    parts.push(provider.apiKey);
  } else if (provider.hasAccessKey) {
    parts.push(t`IAM credentials`);
  }

  return parts.join(' · ');
};

export const SettingsAdminAiProviderListCard = ({
  providers,
  isLoading,
  showAddButton = true,
}: SettingsAdminAiProviderListCardProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <SettingsListCard
        items={[]}
        rounded
        isLoading
        getItemLabel={() => ''}
        RowRightComponent={() => null}
      />
    );
  }

  if (providers.length === 0 && showAddButton) {
    return (
      <StyledLinkContainer>
        <Link to={getSettingsPath(SettingsPath.AdminPanelNewAiProvider)}>
          <SettingsCard title={t`Add Custom Provider`} Icon={<IconPlug />} />
        </Link>
      </StyledLinkContainer>
    );
  }

  if (providers.length === 0) {
    return null;
  }

  return (
    <SettingsListCard
      items={providers}
      rounded
      RowIconFn={(provider) => getProviderIcon(provider.modelsDevName)}
      getItemLabel={(provider) => provider.label ?? provider.name}
      getItemDescription={getProviderDescription}
      RowRightComponent={({ item: provider }) =>
        provider.apiKey || provider.hasAccessKey ? (
          <Status color="green" text={t`Configured`} weight="medium" />
        ) : (
          <Status color="orange" text={t`No credentials`} weight="medium" />
        )
      }
      to={(provider) =>
        getSettingsPath(SettingsPath.AdminPanelAiProviderDetail, {
          providerName: provider.name,
        })
      }
      hasFooter={showAddButton}
      footerButtonLabel={t`Add Custom Provider`}
      onFooterButtonClick={() =>
        navigate(getSettingsPath(SettingsPath.AdminPanelNewAiProvider))
      }
    />
  );
};
