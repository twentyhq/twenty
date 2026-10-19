import { useQuery } from '@apollo/client/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import {
  IconPlus,
  IconCheck,
  IconMicrophone,
  IconSparkles,
  IconClock,
} from 'twenty-ui/icon';
import { FindMarketplaceAppDetailDocument } from '~/generated-metadata/graphql';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import {
  StyledGettingStartedColumn,
  StyledGettingStartedRow,
  StyledGettingStartedMuted,
} from '@/getting-started/components/GettingStartedStyles';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const APPS = [
  {
    universalIdentifier: '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
    label: msg`Call recorder`,
    description: msg`Record calls and keep meeting notes in Twenty.`,
    Icon: IconMicrophone,
  },
  {
    universalIdentifier: '4a1178c1-3535-4a47-b592-231d3216b36f',
    label: msg`Enrichment`,
    description: msg`Enrich people and companies with People Data Labs.`,
    Icon: IconSparkles,
  },
  {
    universalIdentifier: '66a504cc-0a75-410e-a43f-cdeae1db1522',
    label: msg`Last contact`,
    description: msg`See when you last spoke with each contact.`,
    Icon: IconClock,
  },
];

const GettingStartedAppRow = ({ app }: { app: (typeof APPS)[number] }) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const installed = currentWorkspace?.installedApplications.some(
    (application) =>
      application.universalIdentifier === app.universalIdentifier,
  );
  const { data } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: app.universalIdentifier },
    skip: installed,
  });
  const detail = data?.findMarketplaceAppDetail;
  const { install, isInstalling } = useInstallMarketplaceApp({
    universalIdentifier: app.universalIdentifier,
  });
  const { openDialog } = useDialog();
  const modalInstanceId = `getting-started-install-${app.universalIdentifier}`;
  return (
    <>
      <StyledGettingStartedRow
        style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}
      >
        <app.Icon size={20} />
        <div style={{ flex: 1 }}>
          <div>{t(app.label)}</div>
          <StyledGettingStartedMuted>
            {t(app.description)}
          </StyledGettingStartedMuted>
        </div>
        <Button
          size="sm"
          variant="ghost"
          loading={isInstalling}
          disabled={installed || !detail}
          aria-label={t`Install ${t(app.label)}`}
          onClick={() => openDialog(modalInstanceId)}
        >
          {installed ? <IconCheck size={14} /> : <IconPlus size={14} />}
        </Button>
      </StyledGettingStartedRow>
      {detail && (
        <SettingsApplicationInstallPermissionValidationModal
          modalInstanceId={modalInstanceId}
          appDisplayName={detail.name}
          appLogoUrl={detail.logoUrl ?? undefined}
          defaultRole={getMarketplaceAppDefaultRoleManifest(detail)}
          appObjects={detail.objects ?? undefined}
          requestedCapabilities={detail.requestedCapabilities}
          billsCredits={detail.billsCredits}
          isVetted={detail.isVetted}
          onAuthorize={install}
          isInstalling={isInstalling}
        />
      )}
    </>
  );
};

export const GettingStartedAppsAction = () => (
  <StyledGettingStartedColumn>
    {APPS.map((app) => (
      <GettingStartedAppRow key={app.universalIdentifier} app={app} />
    ))}
  </StyledGettingStartedColumn>
);
