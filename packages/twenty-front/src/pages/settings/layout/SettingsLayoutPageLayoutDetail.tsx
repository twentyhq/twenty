import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useApplicationManifest } from '~/pages/settings/layout/hooks/useApplicationManifest';
import {
  type DetailRow,
  renderMonoText,
  SettingsLayoutDetailScaffold,
} from '~/pages/settings/layout/components/SettingsLayoutDetailScaffold';
import { SettingsLayoutItemTable } from '~/pages/settings/layout/components/SettingsLayoutItemTable';
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
      ]
    : [];

  // Tabs sorted by position so the on-page order matches what the user would
  // see in the actual page layout.
  const sortedTabs = [...(pageLayout?.tabs ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <SettingsLayoutDetailScaffold
      applicationId={applicationId}
      applicationName={application?.name}
      entityName={pageLayout?.name ?? t`Page layout`}
      entityTypeLabel={t`page layout`}
      detailRows={detailRows}
      isLoading={isLoading}
    >
      {sortedTabs.map((tab, index) => {
        const widgets = tab.widgets ?? [];
        const tabNumber = index + 1;
        const description =
          isDefined(tab.layoutMode) && widgets.length > 0
            ? t`Layout mode: ${tab.layoutMode} · ${widgets.length} widget(s)`
            : isDefined(tab.layoutMode)
              ? t`Layout mode: ${tab.layoutMode}`
              : widgets.length > 0
                ? t`${widgets.length} widget(s)`
                : t`Empty tab`;

        return (
          <SettingsLayoutItemTable
            key={tab.universalIdentifier}
            title={t`Tab ${tabNumber}: ${tab.title}`}
            description={description}
            columns={[
              { key: 'title', label: t`Widget` },
              { key: 'type', label: t`Type`, width: '160px' },
              { key: 'object', label: t`Object`, width: '180px' },
            ]}
            rows={widgets.map((widget) => ({
              key: widget.universalIdentifier,
              cells: [
                widget.title,
                renderMonoText(widget.type),
                resolveManifestObjectLabel(
                  widget.objectUniversalIdentifier,
                  manifest,
                ) ?? '—',
              ],
            }))}
          />
        );
      })}
    </SettingsLayoutDetailScaffold>
  );
};
