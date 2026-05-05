import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { capitalize, getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import { type ApplicationContentRow } from '~/pages/settings/applications/components/SettingsApplicationContentSubtable';

type InstalledApplicationForContent = Pick<Application, 'agents' | 'id'>;

export const useComputeApplicationContentForLayoutAndLogic = ({
  installedApplication,
  manifestContent,
}: {
  installedApplication?: InstalledApplicationForContent;
  manifestContent?: Manifest;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const installedAppId = installedApplication?.id;

  // Workspace metadata covers standard + installed-app objects; the manifest
  // fallback only matters when previewing an uninstalled marketplace app.
  const resolveLabel = (uid: string | undefined | null) => {
    if (!isDefined(uid)) return undefined;
    return (
      objectMetadataItems.find((o) => o.universalIdentifier === uid)
        ?.labelSingular ??
      manifestContent?.objects.find((o) => o.universalIdentifier === uid)
        ?.labelSingular
    );
  };

  const pageLayoutRows: ApplicationContentRow[] = (
    manifestContent?.pageLayouts ?? []
  ).map((layout) => {
    const objectLabel = resolveLabel(layout.objectUniversalIdentifier);
    const tabCount = layout.tabs?.length ?? 0;

    const parts: string[] = [];
    if (isDefined(objectLabel)) parts.push(t`for ${objectLabel}`);
    if (tabCount > 0) {
      parts.push(tabCount === 1 ? t`1 tab` : t`${tabCount} tabs`);
    }

    return {
      key: layout.universalIdentifier,
      name: layout.name,
      secondary: parts.length > 0 ? parts.join(' · ') : undefined,
      link: isDefined(installedAppId)
        ? getSettingsPath(SettingsPath.ApplicationPageLayoutDetail, {
            applicationId: installedAppId,
            pageLayoutUniversalIdentifier: layout.universalIdentifier,
          })
        : undefined,
    };
  });

  const viewRows: ApplicationContentRow[] = (manifestContent?.views ?? []).map(
    (view) => {
      const objectLabel = resolveLabel(view.objectUniversalIdentifier);
      const formattedType = capitalize((view.type ?? 'TABLE').toLowerCase());

      return {
        key: view.universalIdentifier,
        name: view.name,
        icon: view.icon ?? undefined,
        secondary: isDefined(objectLabel)
          ? t`${formattedType} of ${objectLabel}`
          : formattedType,
        link: isDefined(installedAppId)
          ? getSettingsPath(SettingsPath.ApplicationViewDetail, {
              applicationId: installedAppId,
              viewUniversalIdentifier: view.universalIdentifier,
            })
          : undefined,
      };
    },
  );

  const navigationMenuItemRows: ApplicationContentRow[] = (
    manifestContent?.navigationMenuItems ?? []
  ).map((item) => {
    const destination = (() => {
      switch (item.type) {
        case 'FOLDER':
          return { label: t`Folder`, displayName: t`Folder` };
        case 'LINK': {
          const link = item.link ?? t`Link`;
          return { label: link, displayName: link };
        }
        case 'OBJECT': {
          const label = resolveLabel(item.targetObjectUniversalIdentifier);
          return {
            label: isDefined(label) ? t`${label} list` : t`Object`,
            displayName: label,
          };
        }
        case 'PAGE_LAYOUT': {
          const layout = manifestContent?.pageLayouts?.find(
            (pl) =>
              pl.universalIdentifier === item.pageLayoutUniversalIdentifier,
          );
          return {
            label: isDefined(layout)
              ? t`${layout.name} layout`
              : t`Page layout`,
            displayName: layout?.name,
          };
        }
        case 'VIEW': {
          const view = manifestContent?.views?.find(
            (v) => v.universalIdentifier === item.viewUniversalIdentifier,
          );
          return {
            label: isDefined(view) ? t`${view.name} view` : t`View`,
            displayName: view?.name,
          };
        }
        case 'RECORD':
          return { label: t`Record`, displayName: t`Record` };
        default:
          return { label: undefined, displayName: undefined };
      }
    })();

    const displayName =
      isDefined(item.name) && item.name !== ''
        ? item.name
        : (destination.displayName ?? item.type);

    return {
      key: item.universalIdentifier,
      name: displayName,
      icon: item.icon ?? undefined,
      secondary: destination.label,
    };
  });

  const agentRows: ApplicationContentRow[] = isDefined(installedApplication)
    ? (installedApplication.agents ?? []).map((agent) => ({
        key: agent.id,
        name: agent.label,
        icon: agent.icon ?? undefined,
        secondary: agent.description ?? undefined,
        link: getSettingsPath(SettingsPath.AiAgentDetail, {
          agentId: agent.id,
        }),
      }))
    : (manifestContent?.agents ?? []).map((agent) => ({
        key: agent.universalIdentifier,
        name: agent.label,
        icon: agent.icon ?? undefined,
        secondary: agent.description ?? undefined,
      }));

  const skillRows: ApplicationContentRow[] = (
    manifestContent?.skills ?? []
  ).map((skill) => ({
    key: skill.universalIdentifier,
    name: skill.label,
    icon: skill.icon ?? undefined,
    secondary: skill.description ?? undefined,
  }));

  const roleRows: ApplicationContentRow[] = (manifestContent?.roles ?? []).map(
    (role) => ({
      key: role.universalIdentifier,
      name: role.label,
      icon: role.icon ?? undefined,
      secondary: role.description ?? undefined,
    }),
  );

  const connectionProviderRows: ApplicationContentRow[] = (
    manifestContent?.connectionProviders ?? []
  ).map((provider) => {
    const parts: string[] = [];

    if (provider.type === 'oauth') {
      parts.push(t`OAuth 2.0`);
      const scopeCount = provider.oauth.scopes.length;
      if (scopeCount > 0) {
        parts.push(scopeCount === 1 ? t`1 scope` : t`${scopeCount} scopes`);
      }
    }

    return {
      key: provider.universalIdentifier,
      name: provider.displayName,
      icon: undefined,
      secondary: parts.length > 0 ? parts.join(' · ') : undefined,
    };
  });

  return {
    pageLayoutRows,
    viewRows,
    navigationMenuItemRows,
    agentRows,
    skillRows,
    roleRows,
    connectionProviderRows,
  };
};
