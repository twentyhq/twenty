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

export const SettingsLayoutNavigationMenuItemDetail = () => {
  const { applicationId = '', navigationMenuItemUniversalIdentifier = '' } =
    useParams<{
      applicationId: string;
      navigationMenuItemUniversalIdentifier: string;
    }>();

  const { application, manifest, isLoading } =
    useApplicationManifest(applicationId);

  const item = manifest?.navigationMenuItems?.find(
    (i) => i.universalIdentifier === navigationMenuItemUniversalIdentifier,
  );

  const destinationLabel = (() => {
    if (!isDefined(item)) return undefined;
    switch (item.type) {
      case 'FOLDER':
        return t`Folder (groups other items)`;
      case 'LINK':
        return item.link ?? t`External link`;
      case 'OBJECT':
        return (
          resolveManifestObjectLabel(
            item.targetObjectUniversalIdentifier,
            manifest,
          ) ?? renderMonoText(item.targetObjectUniversalIdentifier)
        );
      case 'PAGE_LAYOUT':
        return (
          manifest?.pageLayouts?.find(
            (pl) =>
              pl.universalIdentifier === item.pageLayoutUniversalIdentifier,
          )?.name ?? renderMonoText(item.pageLayoutUniversalIdentifier)
        );
      case 'VIEW':
        return (
          manifest?.views?.find(
            (v) => v.universalIdentifier === item.viewUniversalIdentifier,
          )?.name ?? renderMonoText(item.viewUniversalIdentifier)
        );
      case 'RECORD':
        return t`Single record`;
      default:
        return t`Unknown`;
    }
  })();

  const detailRows: DetailRow[] = isDefined(item)
    ? [
        {
          key: 'universalIdentifier',
          label: t`Universal identifier`,
          value: renderMonoText(item.universalIdentifier),
        },
        {
          key: 'type',
          label: t`Type`,
          value: item.type,
        },
        {
          key: 'destination',
          label: t`Destination`,
          value: destinationLabel ?? t`None`,
        },
        {
          key: 'icon',
          label: t`Icon`,
          value: renderMonoText(item.icon),
        },
        {
          key: 'color',
          label: t`Color`,
          value: renderMonoText(item.color),
        },
        {
          key: 'position',
          label: t`Position`,
          value: item.position,
        },
      ]
    : [];

  return (
    <SettingsLayoutDetailScaffold
      applicationId={applicationId}
      applicationName={application?.name}
      entityName={
        item?.name && item.name !== ''
          ? item.name
          : (item?.type ?? t`Navigation menu item`)
      }
      entityTypeLabel={t`navigation menu item`}
      detailRows={detailRows}
      isLoading={isLoading}
    />
  );
};
