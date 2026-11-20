import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsConnectedAppRowDropdownMenu } from '@/settings/profile/connected-apps/components/SettingsConnectedAppRowDropdownMenu';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { Section } from 'twenty-ui/components/layout';
import { IconApps } from 'twenty-ui/icon';
import {
  CurrentUserApplicationAuthorizationsDocument,
  type CurrentUserApplicationAuthorizationsQuery,
} from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type ApplicationAuthorizationListItem =
  CurrentUserApplicationAuthorizationsQuery['currentUserApplicationAuthorizations'][number];

export const SettingsProfileConnectedAppsSection = () => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const { data, loading, error } = useQuery(
    CurrentUserApplicationAuthorizationsDocument,
    { fetchPolicy: 'network-only' },
  );

  const applicationAuthorizations =
    data?.currentUserApplicationAuthorizations ?? [];

  const getApplicationAuthorizationDescription = ({
    lastUsedAt,
  }: Pick<ApplicationAuthorizationListItem, 'lastUsedAt'>) => {
    const lastUsed = beautifyPastDateRelativeToNow(lastUsedAt, localeCatalog);

    return t`Last used ${lastUsed}`;
  };

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />
      {!loading && isNonEmptyArray(applicationAuthorizations) && (
        <Section.Root>
          <Section.Header
            title={t`Connected apps`}
            description={t`Apps that can access this workspace on your behalf`}
          />
          <SettingsListCard
            items={applicationAuthorizations}
            getItemLabel={(applicationAuthorization) =>
              applicationAuthorization.applicationName
            }
            getItemDescription={getApplicationAuthorizationDescription}
            RowIcon={IconApps}
            RowRightComponent={SettingsConnectedAppRowDropdownMenu}
          />
        </Section.Root>
      )}
    </>
  );
};
