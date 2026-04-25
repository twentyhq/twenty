import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';
import { type ApplicationNameDescriptionTableRow } from '~/pages/settings/applications/components/SettingsApplicationNameDescriptionTable';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

type InstalledApplicationForContentSections = Pick<Application, 'agents'> & {
  id: string;
};

// Returns row arrays for every "what does this app provide" category beyond
// data/logic/front-components: page layouts, views, navigation menu items,
// agents, skills, and roles.
//
// The Application GraphQL type only exposes a subset of these as installed
// data (currently just `agents`); everything else is read from the marketplace
// manifest, which is loaded by the parent page for both installed and
// preview-only applications. When both sources are available for a category we
// prefer the installed-app data since it reflects actual workspace state.
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

      // Manifest-defined objects (this app's own custom objects)
      const manifestObject = manifestContent?.objects.find(
        (obj) => obj.universalIdentifier === uid,
      );
      if (isDefined(manifestObject)) {
        return manifestObject.labelSingular;
      }

      // Standard objects (resolved by their well-known universalIdentifier)
      const standardName = findObjectNameByUniversalIdentifier(uid);
      if (!isDefined(standardName)) return undefined;

      const item = objectMetadataItems.find(
        (object) => object.nameSingular === standardName,
      );
      return item?.labelSingular;
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
          const fallbackByType = (() => {
            switch (item.type) {
              case 'FOLDER':
                return t`Folder`;
              case 'LINK':
                return item.link ?? t`Link`;
              case 'OBJECT':
                return resolveObjectLabel(item.targetObjectUniversalIdentifier);
              case 'PAGE_LAYOUT':
                return resolvePageLayoutName(
                  item.pageLayoutUniversalIdentifier,
                );
              case 'VIEW':
                return resolveViewName(item.viewUniversalIdentifier);
              case 'RECORD':
                return t`Record`;
              default:
                return undefined;
            }
          })();

          const displayName =
            isDefined(item.name) && item.name !== ''
              ? item.name
              : (fallbackByType ?? item.type);

          const description = (() => {
            switch (item.type) {
              case 'FOLDER':
                return t`Folder`;
              case 'LINK':
                return isDefined(item.link) ? t`Link → ${item.link}` : t`Link`;
              case 'OBJECT': {
                const label = resolveObjectLabel(
                  item.targetObjectUniversalIdentifier,
                );
                return isDefined(label)
                  ? t`Opens the ${label} list`
                  : t`Object`;
              }
              case 'PAGE_LAYOUT': {
                const layoutName = resolvePageLayoutName(
                  item.pageLayoutUniversalIdentifier,
                );
                return isDefined(layoutName)
                  ? t`Opens the ${layoutName} page layout`
                  : t`Page layout`;
              }
              case 'VIEW': {
                const viewName = resolveViewName(item.viewUniversalIdentifier);
                return isDefined(viewName)
                  ? t`Opens the ${viewName} view`
                  : t`View`;
              }
              case 'RECORD':
                return t`Record`;
              default:
                return undefined;
            }
          })();

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
