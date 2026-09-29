import { isString } from '@sniptt/guards';
import { type Manifest } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const reconcilePullBaseManifest = ({
  manifest,
  baseManifest,
  unreconciledUniversalIdentifiers,
  protectedIdentifiers,
}: {
  manifest: Manifest;
  baseManifest: Manifest | null;
  unreconciledUniversalIdentifiers: ReadonlySet<string>;
  protectedIdentifiers: ReadonlySet<string>;
}): Manifest => {
  const getIdentifier = (value: unknown): string | undefined =>
    isPlainObject(value) && isString(value.universalIdentifier)
      ? value.universalIdentifier.toLowerCase()
      : undefined;

  const reconcileEntries = <TEntry>({
    currentEntries,
    previousEntries,
  }: {
    currentEntries: TEntry[];
    previousEntries: TEntry[] | undefined;
  }): TEntry[] => {
    const reconciledEntries = currentEntries.filter((entry) => {
      const identifier = getIdentifier(entry);

      return (
        !isDefined(identifier) ||
        !unreconciledUniversalIdentifiers.has(identifier)
      );
    });
    const reconciledIdentifiers = new Set(reconciledEntries.map(getIdentifier));
    const retainedEntries = (previousEntries ?? []).filter((entry) => {
      const identifier = getIdentifier(entry);

      return (
        isDefined(identifier) &&
        !reconciledIdentifiers.has(identifier) &&
        (unreconciledUniversalIdentifiers.has(identifier) ||
          protectedIdentifiers.has(identifier))
      );
    });

    return [...reconciledEntries, ...retainedEntries];
  };

  return {
    ...manifest,
    application:
      unreconciledUniversalIdentifiers.has(
        manifest.application.universalIdentifier.toLowerCase(),
      ) && isDefined(baseManifest)
        ? baseManifest.application
        : manifest.application,
    objects: reconcileEntries({
      currentEntries: manifest.objects,
      previousEntries: baseManifest?.objects,
    }),
    fields: reconcileEntries({
      currentEntries: manifest.fields,
      previousEntries: baseManifest?.fields,
    }),
    indexes:
      isDefined(manifest.indexes) || isDefined(baseManifest?.indexes)
        ? reconcileEntries({
            currentEntries: manifest.indexes ?? [],
            previousEntries: baseManifest?.indexes,
          })
        : manifest.indexes,
    logicFunctions: reconcileEntries({
      currentEntries: manifest.logicFunctions,
      previousEntries: baseManifest?.logicFunctions,
    }),
    frontComponents: reconcileEntries({
      currentEntries: manifest.frontComponents,
      previousEntries: baseManifest?.frontComponents,
    }),
    permissionFlags: reconcileEntries({
      currentEntries: manifest.permissionFlags,
      previousEntries: baseManifest?.permissionFlags,
    }),
    roles: reconcileEntries({
      currentEntries: manifest.roles,
      previousEntries: baseManifest?.roles,
    }),
    skills: reconcileEntries({
      currentEntries: manifest.skills,
      previousEntries: baseManifest?.skills,
    }),
    agents: reconcileEntries({
      currentEntries: manifest.agents,
      previousEntries: baseManifest?.agents,
    }),
    connectionProviders:
      isDefined(manifest.connectionProviders) ||
      isDefined(baseManifest?.connectionProviders)
        ? reconcileEntries({
            currentEntries: manifest.connectionProviders ?? [],
            previousEntries: baseManifest?.connectionProviders,
          })
        : manifest.connectionProviders,
    publicAssets: reconcileEntries({
      currentEntries: manifest.publicAssets,
      previousEntries: baseManifest?.publicAssets,
    }),
    views: reconcileEntries({
      currentEntries: manifest.views,
      previousEntries: baseManifest?.views,
    }),
    viewFields: reconcileEntries({
      currentEntries: manifest.viewFields,
      previousEntries: baseManifest?.viewFields,
    }),
    navigationMenuItems: reconcileEntries({
      currentEntries: manifest.navigationMenuItems,
      previousEntries: baseManifest?.navigationMenuItems,
    }),
    pageLayouts: reconcileEntries({
      currentEntries: manifest.pageLayouts,
      previousEntries: baseManifest?.pageLayouts,
    }),
    pageLayoutTabs: reconcileEntries({
      currentEntries: manifest.pageLayoutTabs,
      previousEntries: baseManifest?.pageLayoutTabs,
    }),
    pageLayoutWidgets: reconcileEntries({
      currentEntries: manifest.pageLayoutWidgets,
      previousEntries: baseManifest?.pageLayoutWidgets,
    }),
    commandMenuItems: reconcileEntries({
      currentEntries: manifest.commandMenuItems,
      previousEntries: baseManifest?.commandMenuItems,
    }),
    timelineActivityTypes: reconcileEntries({
      currentEntries: manifest.timelineActivityTypes,
      previousEntries: baseManifest?.timelineActivityTypes,
    }),
    settingsMenuItems: reconcileEntries({
      currentEntries: manifest.settingsMenuItems,
      previousEntries: baseManifest?.settingsMenuItems,
    }),
  };
};
