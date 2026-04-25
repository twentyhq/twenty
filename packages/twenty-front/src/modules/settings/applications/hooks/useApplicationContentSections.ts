import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  type Application,
  FindManySkillsDocument,
  GetRolesDocument,
} from '~/generated-metadata/graphql';
import { type ApplicationContentRow } from '~/pages/settings/applications/components/SettingsApplicationContentSubtable';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

type InstalledApplicationForContentSections = Pick<
  Application,
  'agents' | 'id'
>;

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

  // Workspace skills + roles let us link manifest entries to their
  // settings detail pages by id (manifest only carries universalIdentifier).
  // Both queries are cache-first so revisiting the page doesn't re-fetch.
  const installedAppId = isDefined(installedApplication)
    ? installedApplication.id
    : undefined;
  const { data: skillsData } = useQuery(FindManySkillsDocument, {
    fetchPolicy: 'cache-first',
    skip: !isDefined(installedAppId),
  });
  const { data: rolesData } = useQuery(GetRolesDocument, {
    fetchPolicy: 'cache-first',
    skip: !isDefined(installedAppId),
  });

  const skillIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const skill of skillsData?.skills ?? []) {
      if (skill.applicationId === installedAppId) {
        map.set(skill.name, skill.id);
      }
    }
    return map;
  }, [skillsData?.skills, installedAppId]);

  const roleIdByUniversalIdentifier = useMemo(() => {
    const map = new Map<string, string>();
    for (const role of rolesData?.getRoles ?? []) {
      if (isDefined(role.universalIdentifier)) {
        map.set(role.universalIdentifier, role.id);
      }
    }
    return map;
  }, [rolesData?.getRoles]);

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
    (): ApplicationContentRow[] =>
      (manifestContent?.pageLayouts ?? []).map((layout) => {
        const objectLabel = resolveObjectLabel(
          layout.objectUniversalIdentifier,
        );
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
      }),
    [manifestContent?.pageLayouts, resolveObjectLabel, installedAppId],
  );

  const viewRows = useMemo(
    (): ApplicationContentRow[] =>
      (manifestContent?.views ?? []).map((view) => {
        const objectLabel = resolveObjectLabel(view.objectUniversalIdentifier);
        const viewType = view.type ?? 'TABLE';
        const formattedType =
          viewType.charAt(0) + viewType.slice(1).toLowerCase();

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
      }),
    [manifestContent?.views, resolveObjectLabel, installedAppId],
  );

  const navigationMenuItemRows = useMemo(
    (): ApplicationContentRow[] =>
      (manifestContent?.navigationMenuItems ?? [])
        .map((item) => {
          // Resolve the destination once per item so display name and secondary
          // don't both walk the manifest arrays.
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
              case 'FOLDER':
              case 'RECORD':
                return destination.label;
              default:
                return undefined;
            }
          })();

          const secondary = (() => {
            switch (destination.kind) {
              case 'FOLDER':
                return t`Folder`;
              case 'LINK':
                return isDefined(destination.link) ? destination.link : t`Link`;
              case 'OBJECT':
                return isDefined(destination.label)
                  ? t`${destination.label} list`
                  : t`Object`;
              case 'PAGE_LAYOUT':
                return isDefined(destination.label)
                  ? t`${destination.label} layout`
                  : t`Page layout`;
              case 'VIEW':
                return isDefined(destination.label)
                  ? t`${destination.label} view`
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
            secondary,
            link: isDefined(installedAppId)
              ? getSettingsPath(
                  SettingsPath.ApplicationNavigationMenuItemDetail,
                  {
                    applicationId: installedAppId,
                    navigationMenuItemUniversalIdentifier:
                      item.universalIdentifier,
                  },
                )
              : undefined,
          };
        })
        .filter((row) => isDefined(row.name)),
    [
      manifestContent?.navigationMenuItems,
      resolveObjectLabel,
      resolvePageLayoutName,
      resolveViewName,
      installedAppId,
    ],
  );

  const agentRows = useMemo((): ApplicationContentRow[] => {
    if (
      isDefined(installedApplication) &&
      installedApplication.agents.length > 0
    ) {
      return installedApplication.agents.map((agent) => ({
        key: agent.id,
        name: agent.label,
        icon: agent.icon ?? undefined,
        secondary: agent.description ?? undefined,
        link: getSettingsPath(SettingsPath.AiAgentDetail, {
          agentId: agent.id,
        }),
      }));
    }

    return (manifestContent?.agents ?? []).map((agent) => ({
      key: agent.universalIdentifier,
      name: agent.label,
      icon: agent.icon ?? undefined,
      secondary: agent.description ?? undefined,
    }));
  }, [installedApplication, manifestContent?.agents]);

  const skillRows = useMemo(
    (): ApplicationContentRow[] =>
      (manifestContent?.skills ?? []).map((skill) => {
        const workspaceSkillId = skillIdByName.get(skill.name);
        return {
          key: skill.universalIdentifier,
          name: skill.label,
          icon: skill.icon ?? undefined,
          secondary: skill.description ?? undefined,
          link: isDefined(workspaceSkillId)
            ? getSettingsPath(SettingsPath.AiSkillDetail, {
                skillId: workspaceSkillId,
              })
            : undefined,
        };
      }),
    [manifestContent?.skills, skillIdByName],
  );

  const roleRows = useMemo(
    (): ApplicationContentRow[] =>
      (manifestContent?.roles ?? []).map((role) => {
        const workspaceRoleId = roleIdByUniversalIdentifier.get(
          role.universalIdentifier,
        );
        return {
          key: role.universalIdentifier,
          name: role.label,
          icon: role.icon ?? undefined,
          secondary: role.description ?? undefined,
          link: isDefined(workspaceRoleId)
            ? getSettingsPath(SettingsPath.RoleDetail, {
                roleId: workspaceRoleId,
              })
            : undefined,
        };
      }),
    [manifestContent?.roles, roleIdByUniversalIdentifier],
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
