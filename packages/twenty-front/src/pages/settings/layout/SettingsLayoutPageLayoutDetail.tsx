import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useApplicationManifest } from '~/pages/settings/layout/hooks/useApplicationManifest';
import {
  type DetailRow,
  SettingsLayoutDetailScaffold,
} from '~/pages/settings/layout/components/SettingsLayoutDetailScaffold';
import { SettingsLayoutItemTable } from '~/pages/settings/layout/components/SettingsLayoutItemTable';

export const SettingsLayoutPageLayoutDetail = () => {
  const { applicationId = '', pageLayoutUniversalIdentifier = '' } = useParams<{
    applicationId: string;
    pageLayoutUniversalIdentifier: string;
  }>();

  const { application, manifest, isLoading } =
    useApplicationManifest(applicationId);

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const findObjectLabel = (uid: string | undefined) =>
    isDefined(uid)
      ? objectMetadataItems.find((o) => o.universalIdentifier === uid)
          ?.labelSingular
      : undefined;

  const pageLayout = manifest?.pageLayouts?.find(
    (pl) => pl.universalIdentifier === pageLayoutUniversalIdentifier,
  );

  const objectLabel = isDefined(pageLayout)
    ? findObjectLabel(pageLayout.objectUniversalIdentifier)
    : undefined;

  const detailRows: DetailRow[] = isDefined(pageLayout)
    ? [
        {
          key: 'universalIdentifier',
          label: t`Universal identifier`,
          value: pageLayout.universalIdentifier,
        },
        { key: 'type', label: t`Type`, value: pageLayout.type ?? t`Default` },
        {
          key: 'object',
          label: t`Object`,
          value: objectLabel ?? pageLayout.objectUniversalIdentifier,
        },
      ]
    : [];

  const sortedTabs = [...(pageLayout?.tabs ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <SettingsLayoutDetailScaffold
      applicationId={applicationId}
      applicationName={application?.name}
      entityName={pageLayout?.name ?? t`Page layout`}
      entityTypeLabel={t`page layout`}
      categoryLabel={t`Page layouts`}
      detailRows={detailRows}
      isLoading={isLoading}
    >
      {sortedTabs.map((tab, index) => {
        const widgets = tab.widgets ?? [];
        const tabNumber = index + 1;

        const descriptionParts: string[] = [];
        if (isDefined(tab.layoutMode)) {
          descriptionParts.push(t`Layout mode: ${tab.layoutMode}`);
        }
        if (widgets.length > 0) {
          descriptionParts.push(
            widgets.length === 1 ? t`1 widget` : t`${widgets.length} widgets`,
          );
        }
        const description =
          descriptionParts.length > 0
            ? descriptionParts.join(' · ')
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
                widget.type,
                findObjectLabel(widget.objectUniversalIdentifier) ?? '—',
              ],
            }))}
          />
        );
      })}
    </SettingsLayoutDetailScaffold>
  );
};
