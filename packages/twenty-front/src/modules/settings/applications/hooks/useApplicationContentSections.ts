import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import { type ApplicationNameDescriptionTableRow } from '~/pages/settings/applications/components/SettingsApplicationNameDescriptionTable';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

type InstalledApplicationForContentSections = Pick<Application, 'agents'>;

// Returns row arrays for every "what does this app provide" category beyond
// data/logic/front-components. Most categories aren't on the GraphQL
// Application type so they're read from the marketplace manifest the parent
// loads alongside the installed app; we prefer installed-app data when both
// sources exist (currently only `agents`).
export const useApplicationContentSections = ({
  installedApplication,
  manifestContent,
}: {
  installedApplication?: InstalledApplicationForContentSections;
  manifestContent?: Manifest;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const resolveObjectLabel = useCallback(
    (uid: string | undefined | null): string | undefined => {
      if (!isDefined(uid)) return undefined;

      const manifestObject = manifestContent?.objects.find(
        (obj) => obj.universalIdentifier === uid,
      );
      if (isDefined(manifestObject)) {
        return manifestObject.labelSingular;
      }

      const standardName = findObjectNameByUniversalIdentifier(uid);
      if (!isDefined(standardName)) return undefined;

      return objectMetadataItems.find(
        (object) => object.nameSingular === standardName,
      )?.labelSingular;
    },
    [manifestContent?.objects, objectMetadataItems],
  );

  const resolvePageLayoutName = useCallback(
    (uid: string | undefined | null): string | undefined => {
      if (!isDefined(uid)) return undefined;
      return manifestContent?.pageLayouts?.find(
        (pl) => pl.universalIdentifier === uid,
      )?.name;
    },
    [manifestContent?.pageLayouts],
  );

  const resolveViewName = useCallback(
    (uid: string | undefined | null): string | undefined => {
      if (!isDefined(uid)) return undefined;
      return manifestContent?.views?.find(
        (view) => view.universalIdentifier === uid,
      )?.name;
    },
    [manifestContent?.views],
  );

  const pageLayoutRows = useMemo(
    (): ApplicationNameDescriptionTableRow[] =>
      (manifestContent?.pageLayouts ?? []).map((layout) => {
        const objectLabel = resolveObjectLabel(
          layout.objectUniversalIdentifier,
        );
        const tabCount = layout.tabs?.length ?? 0;

        const descriptionParts: string[] = [];
        if (isDefined(objectLabel)) {
          descriptionParts.push(t`for ${objectLabel}`);
        }
        if (tabCount > 0) {
          descriptionParts.push(
            tabCount === 1 ? t`1 tab` : t`${tabCount} tabs`,
          );
        }

        return {
          key: layout.universalIdentifier,
          name: layout.name,
          description:
            descriptionParts.length > 0
              ? descriptionParts.join(' · ')
              : undefined,
        };
      }),
    [manifestContent?.pageLayouts, resolveObjectLabel],
  );

  const viewRows = useMemo(
    (): ApplicationNameDescriptionTableRow[] =>
      (manifestContent?.views ?? []).map((view) => {
        const objectLabel = resolveObjectLabel(view.objectUniversalIdentifier);
        const viewType = view.type ?? 'TABLE';
        const formattedType =
          viewType.charAt(0) + viewType.slice(1).toLowerCase();

        return {
          key: view.universalIdentifier,
          name: view.name,
          icon: view.icon ?? undefined,
          description: isDefined(objectLabel)
            ? t`${formattedType} of ${objectLabel}`
            : formattedType,
        };
      }),
    [manifestContent?.views, resolveObjectLabel],
  );

  const navigationMenuItemRows = useMemo(
    (): ApplicationNameDescriptionTableRow[] =>
      (manifestContent?.navigationMenuItems ?? [])
        .map((item) => {
          // Resolve the destination once per item so display name and
          // description don't both walk the manifest arrays.
          const destination = (() => {
            switch (item.type) {
              case 'FOLDER':
                return { kind: 'FOLDER' as const, label: t`Folder` };
              case 'LINK':
                return { kind: 'LINK' as const, link: item.link };
              case 'OBJECT':
                return {
                  kind: 'OBJECT' as const,
                  label: resolveObjectLabel(
                    item.targetObjectUniversalIdentifier,
                  ),
                };
              case 'PAGE_LAYOUT':
                return {
                  kind: 'PAGE_LAYOUT' as const,
                  label: resolvePageLayoutName(
                    item.pageLayoutUniversalIdentifier,
                  ),
                };
              case 'VIEW':
                return {
                  kind: 'VIEW' as const,
                  label: resolveViewName(item.viewUniversalIdentifier),
                };
              case 'RECORD':
                return { kind: 'RECORD' as const, label: t`Record` };
              default:
                return { kind: 'UNKNOWN' as const };
            }
          })();

          const fallbackName = (() => {
            switch (destination.kind) {
              case 'LINK':
                return destination.link ?? t`Link`;
              case 'OBJECT':
              case 'PAGE_LAYOUT':
              case 'VIEW':
                return destination.label;
              case 'FOLDER':
              case 'RECORD':
                return destination.label;
              default:
                return undefined;
            }
          })();

          const description = (() => {
            switch (destination.kind) {
              case 'FOLDER':
                return t`Folder`;
              case 'LINK':
                return isDefined(destination.link)
                  ? t`Link → ${destination.link}`
                  : t`Link`;
              case 'OBJECT':
                return isDefined(destination.label)
                  ? t`Opens the ${destination.label} list`
                  : t`Object`;
              case 'PAGE_LAYOUT':
                return isDefined(destination.label)
                  ? t`Opens the ${destination.label} page layout`
                  : t`Page layout`;
              case 'VIEW':
                return isDefined(destination.label)
                  ? t`Opens the ${destination.label} view`
                  : t`View`;
              case 'RECORD':
                return t`Record`;
              default:
                return undefined;
            }
          })();

          const displayName =
            isDefined(item.name) && item.name !== ''
              ? item.name
              : (fallbackName ?? item.type);

          return {
            key: item.universalIdentifier,
            name: displayName,
            icon: item.icon ?? undefined,
            description,
          };
        })
        .filter((row) => isDefined(row.name)),
    [
      manifestContent?.navigationMenuItems,
      resolveObjectLabel,
      resolvePageLayoutName,
      resolveViewName,
    ],
  );

  const agentRows = useMemo((): ApplicationNameDescriptionTableRow[] => {
    if (
      isDefined(installedApplication) &&
      installedApplication.agents.length > 0
    ) {
      return installedApplication.agents.map((agent) => ({
        key: agent.id,
        name: agent.label,
        icon: agent.icon ?? undefined,
        description: agent.description ?? undefined,
      }));
    }

    return (manifestContent?.agents ?? []).map((agent) => ({
      key: agent.universalIdentifier,
      name: agent.label,
      icon: agent.icon ?? undefined,
      description: agent.description ?? undefined,
    }));
  }, [installedApplication, manifestContent?.agents]);

  const skillRows = useMemo(
    (): ApplicationNameDescriptionTableRow[] =>
      (manifestContent?.skills ?? []).map((skill) => ({
        key: skill.universalIdentifier,
        name: skill.label,
        icon: skill.icon ?? undefined,
        description: skill.description ?? undefined,
      })),
    [manifestContent?.skills],
  );

  const roleRows = useMemo(
    (): ApplicationNameDescriptionTableRow[] =>
      (manifestContent?.roles ?? []).map((role) => ({
        key: role.universalIdentifier,
        name: role.label,
        icon: role.icon ?? undefined,
        description: role.description ?? undefined,
      })),
    [manifestContent?.roles],
  );

  return {
    pageLayoutRows,
    viewRows,
    navigationMenuItemRows,
    agentRows,
    skillRows,
    roleRows,
  };
};
