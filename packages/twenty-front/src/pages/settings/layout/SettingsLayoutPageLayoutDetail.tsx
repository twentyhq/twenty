import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useApplicationManifest } from '~/pages/settings/layout/hooks/useApplicationManifest';
import {
  type DetailRow,
  renderMonoText,
  SettingsLayoutDetailScaffold,
} from '~/pages/settings/layout/components/SettingsLayoutDetailScaffold';
import { resolveManifestObjectLabel } from '~/pages/settings/layout/utils/resolveManifestObjectLabel';

export const SettingsLayoutPageLayoutDetail = () => {
  const { applicationId = '', pageLayoutUniversalIdentifier = '' } = useParams<{
    applicationId: string;
    pageLayoutUniversalIdentifier: string;
  }>();

  const { application, manifest, isLoading } =
    useApplicationManifest(applicationId);

  const pageLayout = manifest?.pageLayouts?.find(
    (pl) => pl.universalIdentifier === pageLayoutUniversalIdentifier,
  );

  const objectLabel = isDefined(pageLayout)
    ? resolveManifestObjectLabel(pageLayout.objectUniversalIdentifier, manifest)
    : undefined;

  const tabSummary =
    pageLayout?.tabs && pageLayout.tabs.length > 0
      ? pageLayout.tabs.map((tab) => tab.title).join(', ')
      : t`No tabs`;

  const totalWidgets =
    pageLayout?.tabs?.reduce(
      (sum, tab) => sum + (tab.widgets?.length ?? 0),
      0,
    ) ?? 0;

  const detailRows: DetailRow[] = isDefined(pageLayout)
    ? [
        {
          key: 'universalIdentifier',
          label: t`Universal identifier`,
          value: renderMonoText(pageLayout.universalIdentifier),
        },
        {
          key: 'type',
          label: t`Type`,
          value: pageLayout.type ?? t`Default`,
        },
        {
          key: 'object',
          label: t`Object`,
          value:
            objectLabel ?? renderMonoText(pageLayout.objectUniversalIdentifier),
        },
        {
          key: 'tabsCount',
          label: t`Tabs`,
          value: pageLayout.tabs?.length ?? 0,
        },
        {
          key: 'tabsList',
          label: t`Tab titles`,
          value: tabSummary,
        },
        {
          key: 'widgets',
          label: t`Widgets across tabs`,
          value: totalWidgets,
        },
      ]
    : [];

  return (
    <SettingsLayoutDetailScaffold
      applicationId={applicationId}
      applicationName={application?.name}
      entityName={pageLayout?.name ?? t`Page layout`}
      entityTypeLabel={t`page layout`}
      detailRows={detailRows}
      isLoading={isLoading}
    />
  );
};
