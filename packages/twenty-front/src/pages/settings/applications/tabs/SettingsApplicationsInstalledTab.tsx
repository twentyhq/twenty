import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconChevronDown, IconDownload, IconUpload } from 'twenty-ui/display';
import { Button, ButtonGroup, IconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import {
  INSTALL_NPM_APP_MODAL_ID,
  SettingsInstallNpmAppModal,
} from '~/pages/settings/applications/components/SettingsInstallNpmAppModal';
import {
  SettingsUploadTarballModal,
  UPLOAD_TARBALL_MODAL_ID,
} from '~/pages/settings/applications/components/SettingsUploadTarballModal';

const INSTALL_APP_DROPDOWN_ID = 'install-app-dropdown';

const StyledButtonGroupContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

export const SettingsApplicationsInstalledTab = () => {
  const { t } = useLingui();
  const { data } = useFindManyApplicationsQuery();
  const { openModal } = useModal();
  const { closeDropdown } = useCloseDropdown();

  const applications = data?.findManyApplications ?? [];

  const handleInstallFromNpm = () => {
    closeDropdown(INSTALL_APP_DROPDOWN_ID);
    openModal(INSTALL_NPM_APP_MODAL_ID);
  };

  const handleUploadTarball = () => {
    closeDropdown(INSTALL_APP_DROPDOWN_ID);
    openModal(UPLOAD_TARBALL_MODAL_ID);
  };

  return (
    <>
      {applications.length > 0 && (
        <SettingsApplicationsTable applications={applications} />
      )}

      <Section>
        <StyledButtonGroupContainer>
          <ButtonGroup size="small" variant="secondary">
            <Button
              Icon={IconDownload}
              title={t`Install app`}
              onClick={handleInstallFromNpm}
            />
            <Dropdown
              dropdownId={INSTALL_APP_DROPDOWN_ID}
              clickableComponent={
                <IconButton
                  size="small"
                  variant="secondary"
                  Icon={IconChevronDown}
                  position="right"
                />
              }
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      LeftIcon={IconDownload}
                      text={t`Install from npm`}
                      onClick={handleInstallFromNpm}
                    />
                    <MenuItem
                      LeftIcon={IconUpload}
                      text={t`Upload tarball`}
                      onClick={handleUploadTarball}
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          </ButtonGroup>
        </StyledButtonGroupContainer>
      </Section>

      <SettingsInstallNpmAppModal />
      <SettingsUploadTarballModal />
    </>
  );
};
