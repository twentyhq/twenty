import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { IconDownload, IconUpload } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isDefined } from 'twenty-shared/utils';
import {
  useFindManyApplicationRegistrationsQuery,
  useFindManyApplicationsQuery,
} from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import {
  SettingsInstallNpmAppModal,
  INSTALL_NPM_APP_MODAL_ID,
} from '~/pages/settings/applications/components/SettingsInstallNpmAppModal';
import {
  SettingsUploadTarballModal,
  UPLOAD_TARBALL_MODAL_ID,
} from '~/pages/settings/applications/components/SettingsUploadTarballModal';

const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

export const SettingsApplicationsInstalledTab = () => {
  const { t } = useLingui();
  const { data } = useFindManyApplicationsQuery();
  const { data: registrationsData } =
    useFindManyApplicationRegistrationsQuery();
  const { openModal } = useModal();

  const applications = data?.findManyApplications ?? [];

  const registrationVersionMap = useMemo(() => {
    const map = new Map<string, string>();
    const registrations =
      registrationsData?.findManyApplicationRegistrations ?? [];

    for (const registration of registrations) {
      if (isDefined(registration.latestAvailableVersion)) {
        map.set(registration.id, registration.latestAvailableVersion);
      }
    }

    return map;
  }, [registrationsData]);

  return (
    <>
      <Section>
        <StyledButtonGroup>
          <Button
            Icon={IconDownload}
            title={t`Install from npm`}
            variant="secondary"
            size="small"
            onClick={() => openModal(INSTALL_NPM_APP_MODAL_ID)}
          />
          <Button
            Icon={IconUpload}
            title={t`Upload tarball`}
            variant="secondary"
            size="small"
            onClick={() => openModal(UPLOAD_TARBALL_MODAL_ID)}
          />
        </StyledButtonGroup>
      </Section>

      {applications.length > 0 && (
        <SettingsApplicationsTable
          applications={applications}
          registrationVersionMap={registrationVersionMap}
        />
      )}

      <SettingsInstallNpmAppModal />
      <SettingsUploadTarballModal />
    </>
  );
};
