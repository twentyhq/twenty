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

export const SettingsLayoutViewDetail = () => {
  const { applicationId = '', viewUniversalIdentifier = '' } = useParams<{
    applicationId: string;
    viewUniversalIdentifier: string;
  }>();

  const { application, manifest, isLoading } =
    useApplicationManifest(applicationId);

  const view = manifest?.views?.find(
    (v) => v.universalIdentifier === viewUniversalIdentifier,
  );

  const objectLabel = isDefined(view)
    ? resolveManifestObjectLabel(view.objectUniversalIdentifier, manifest)
    : undefined;

  const detailRows: DetailRow[] = isDefined(view)
    ? [
        {
          key: 'universalIdentifier',
          label: t`Universal identifier`,
          value: renderMonoText(view.universalIdentifier),
        },
        {
          key: 'type',
          label: t`Type`,
          value: view.type ?? t`Table`,
        },
        {
          key: 'object',
          label: t`Object`,
          value: objectLabel ?? renderMonoText(view.objectUniversalIdentifier),
        },
        {
          key: 'icon',
          label: t`Icon`,
          value: renderMonoText(view.icon),
        },
        {
          key: 'visibility',
          label: t`Visibility`,
          value: view.visibility ?? t`Default`,
        },
        {
          key: 'fields',
          label: t`Fields`,
          value: view.fields?.length ?? 0,
        },
        {
          key: 'filters',
          label: t`Filters`,
          value: view.filters?.length ?? 0,
        },
        {
          key: 'sorts',
          label: t`Sorts`,
          value: view.sorts?.length ?? 0,
        },
      ]
    : [];

  return (
    <SettingsLayoutDetailScaffold
      applicationId={applicationId}
      applicationName={application?.name}
      entityName={view?.name ?? t`View`}
      entityTypeLabel={t`view`}
      detailRows={detailRows}
      isLoading={isLoading}
    />
  );
};
