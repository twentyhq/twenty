import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useApplicationManifest } from '~/pages/settings/layout/hooks/useApplicationManifest';
import { MonoText } from '~/pages/settings/layout/components/MonoText';
import {
  type DetailRow,
  SettingsLayoutDetailScaffold,
} from '~/pages/settings/layout/components/SettingsLayoutDetailScaffold';
import { getNavigationMenuItemDestination } from '~/pages/settings/layout/utils/getNavigationMenuItemDestination';

const renderDestinationLabel = (
  destination: ReturnType<typeof getNavigationMenuItemDestination>,
) => {
  switch (destination.kind) {
    case 'FOLDER':
      return t`Folder (groups other items)`;
    case 'LINK':
      return destination.link ?? t`External link`;
    case 'OBJECT':
      return destination.label ?? t`Object`;
    case 'PAGE_LAYOUT':
      return destination.label ?? t`Page layout`;
    case 'VIEW':
      return destination.label ?? t`View`;
    case 'RECORD':
      return t`Single record`;
    default:
      return t`Unknown`;
  }
};

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

  const destinationLabel = isDefined(item)
    ? renderDestinationLabel(getNavigationMenuItemDestination(item, manifest))
    : undefined;

  const detailRows: DetailRow[] = isDefined(item)
    ? [
        {
          key: 'universalIdentifier',
          label: t`Universal identifier`,
          value: <MonoText value={item.universalIdentifier} />,
        },
        { key: 'type', label: t`Type`, value: item.type },
        {
          key: 'destination',
          label: t`Destination`,
          value: destinationLabel ?? t`None`,
        },
        { key: 'icon', label: t`Icon`, value: <MonoText value={item.icon} /> },
        {
          key: 'color',
          label: t`Color`,
          value: <MonoText value={item.color} />,
        },
        { key: 'position', label: t`Position`, value: item.position },
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
