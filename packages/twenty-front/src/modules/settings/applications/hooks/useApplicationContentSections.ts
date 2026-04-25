import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { capitalize, getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  type Application,
  FindManySkillsDocument,
  GetRolesDocument,
} from '~/generated-metadata/graphql';
import { type ApplicationContentRow } from '~/pages/settings/applications/components/SettingsApplicationContentSubtable';
import {
  getNavigationMenuItemDestination,
  getNavigationMenuItemDestinationSecondary,
  getNavigationMenuItemDisplayLabel,
} from '~/pages/settings/layout/utils/getNavigationMenuItemDestination';
import { resolveManifestObjectLabel } from '~/pages/settings/layout/utils/resolveManifestObjectLabel';

type InstalledApplicationForContentSections = Pick<
  Application,
  'agents' | 'id'
>;

export const useApplicationContentSections = ({
  installedApplication,
  manifestContent,
}: {
  installedApplication?: InstalledApplicationForContentSections;
  manifestContent?: Manifest;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  // Skills + roles are loaded so manifest entries can be linked to their
  // settings detail pages by workspace id (manifest only carries
  // universalIdentifier). Cache-first; both keyed on the document only so
  // they share one fetch across the session.
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
    (uid: string | undefined | null): string | undefined =>
      resolveManifestObjectLabel(uid, manifestContent, objectMetadataItems),
    [manifestContent, objectMetadataItems],
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
      }),
    [manifestContent?.views, resolveObjectLabel, installedAppId],
  );

  const navigationMenuItemRows = useMemo(
    (): ApplicationContentRow[] =>
      (manifestContent?.navigationMenuItems ?? [])
        .map((item) => {
          const destination = getNavigationMenuItemDestination(
            item,
            manifestContent,
            objectMetadataItems,
          );
          const fallbackName = getNavigationMenuItemDisplayLabel(destination);
          const displayName =
            isDefined(item.name) && item.name !== ''
              ? item.name
              : (fallbackName ?? item.type);

          return {
            key: item.universalIdentifier,
            name: displayName,
            icon: item.icon ?? undefined,
            secondary: getNavigationMenuItemDestinationSecondary(destination),
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
    [manifestContent, objectMetadataItems, installedAppId],
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
