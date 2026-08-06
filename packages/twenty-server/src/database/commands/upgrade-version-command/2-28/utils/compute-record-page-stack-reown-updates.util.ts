import {
  getPageLayoutTabUniversalIdentifier,
  getPageLayoutWidgetUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getViewFieldGroupUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

type ReownLogger = { warn: (message: string) => void };

export type RecordPageReownUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
    key?: ViewKey;
    applicationId?: string;
  };
};

export type RecordPageReownUpdates = {
  pageLayoutUpdates: RecordPageReownUpdate[];
  pageLayoutTabUpdates: RecordPageReownUpdate[];
  pageLayoutWidgetUpdates: RecordPageReownUpdate[];
  viewUpdates: RecordPageReownUpdate[];
  viewFieldUpdates: RecordPageReownUpdate[];
  viewFieldGroupUpdates: RecordPageReownUpdate[];
};

export const createEmptyRecordPageReownUpdates =
  (): RecordPageReownUpdates => ({
    pageLayoutUpdates: [],
    pageLayoutTabUpdates: [],
    pageLayoutWidgetUpdates: [],
    viewUpdates: [],
    viewFieldUpdates: [],
    viewFieldGroupUpdates: [],
  });

export const countRecordPageReownUpdates = (
  reownUpdates: RecordPageReownUpdates,
): number =>
  Object.values(reownUpdates).reduce(
    (count, updates) => count + updates.length,
    0,
  );

type RecordPageStackMaps = Pick<
  AllFlatEntityMaps,
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatFieldMetadataMaps'
  | 'flatPageLayoutMaps'
  | 'flatPageLayoutTabMaps'
  | 'flatPageLayoutWidgetMaps'
>;

type ComputeRecordPageStackReownUpdatesArgs = {
  workspaceId: string;
  logger: ReownLogger;
  flatObjectMetadata: NonNullable<
    AllFlatEntityMaps['flatObjectMetadataMaps']['byUniversalIdentifier'][string]
  >;
  flatPageLayout: NonNullable<
    AllFlatEntityMaps['flatPageLayoutMaps']['byUniversalIdentifier'][string]
  >;
  derivedPageLayoutUniversalIdentifier: string;
  engineOwnedApplicationUniversalIdentifiers: Set<string>;
  twentyStandardApplicationUniversalIdentifier: string;
} & RecordPageStackMaps;

// Re-own one system record-page stack (layout, tabs, widgets, the FIELDS
// widget view, its view fields and standard-authored groups) onto the derived
// identifier scheme, flagging everything isSystemSideEffect. Rows owned by
// other applications (e.g. app-authored tabs attached to the engine layout)
// are left untouched. universalIdentifier is unique per workspace including
// soft-deleted rows, so any derived identifier already held by another row is
// skipped with a warning instead of aborting the transaction.
export const computeRecordPageStackReownUpdates = ({
  workspaceId,
  logger,
  flatObjectMetadata,
  flatPageLayout,
  derivedPageLayoutUniversalIdentifier,
  engineOwnedApplicationUniversalIdentifiers,
  twentyStandardApplicationUniversalIdentifier,
  flatViewMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatFieldMetadataMaps,
  flatPageLayoutMaps,
  flatPageLayoutTabMaps,
  flatPageLayoutWidgetMaps,
}: ComputeRecordPageStackReownUpdatesArgs): RecordPageReownUpdates => {
  const reownUpdates = createEmptyRecordPageReownUpdates();

  pushReownUpdate({
    workspaceId,
    logger,
    updates: reownUpdates.pageLayoutUpdates,
    flatEntity: flatPageLayout,
    derivedUniversalIdentifier: derivedPageLayoutUniversalIdentifier,
    flatEntitiesByUniversalIdentifier: flatPageLayoutMaps.byUniversalIdentifier,
  });

  const seenDerivedTabUniversalIdentifiers = new Set<string>();

  for (const tabUniversalIdentifier of flatPageLayout.tabUniversalIdentifiers) {
    const flatPageLayoutTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[tabUniversalIdentifier];

    if (
      !isDefined(flatPageLayoutTab) ||
      isDefined(flatPageLayoutTab.deletedAt) ||
      // App-authored tabs attached to the engine layout stay app-owned.
      !engineOwnedApplicationUniversalIdentifiers.has(
        flatPageLayoutTab.applicationUniversalIdentifier,
      )
    ) {
      continue;
    }

    const derivedTabUniversalIdentifier = getPageLayoutTabUniversalIdentifier({
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      pageLayoutUniversalIdentifier: derivedPageLayoutUniversalIdentifier,
      title: flatPageLayoutTab.title,
    });

    if (seenDerivedTabUniversalIdentifiers.has(derivedTabUniversalIdentifier)) {
      logger.warn(
        `Duplicate tab title "${flatPageLayoutTab.title}" on record-page layout ${flatPageLayout.id} in workspace ${workspaceId}, skipping tab ${flatPageLayoutTab.id}`,
      );
      continue;
    }
    seenDerivedTabUniversalIdentifiers.add(derivedTabUniversalIdentifier);

    pushReownUpdate({
      workspaceId,
      logger,
      updates: reownUpdates.pageLayoutTabUpdates,
      flatEntity: flatPageLayoutTab,
      derivedUniversalIdentifier: derivedTabUniversalIdentifier,
      flatEntitiesByUniversalIdentifier:
        flatPageLayoutTabMaps.byUniversalIdentifier,
    });

    computeWidgetReownUpdates({
      workspaceId,
      logger,
      reownUpdates,
      flatObjectMetadata,
      flatPageLayoutTab,
      derivedTabUniversalIdentifier,
      engineOwnedApplicationUniversalIdentifiers,
      twentyStandardApplicationUniversalIdentifier,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatFieldMetadataMaps,
      flatPageLayoutWidgetMaps,
    });
  }

  return reownUpdates;
};

const computeWidgetReownUpdates = ({
  workspaceId,
  logger,
  reownUpdates,
  flatObjectMetadata,
  flatPageLayoutTab,
  derivedTabUniversalIdentifier,
  engineOwnedApplicationUniversalIdentifiers,
  twentyStandardApplicationUniversalIdentifier,
  flatViewMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatFieldMetadataMaps,
  flatPageLayoutWidgetMaps,
}: {
  workspaceId: string;
  logger: ReownLogger;
  reownUpdates: RecordPageReownUpdates;
  flatObjectMetadata: ComputeRecordPageStackReownUpdatesArgs['flatObjectMetadata'];
  flatPageLayoutTab: NonNullable<
    AllFlatEntityMaps['flatPageLayoutTabMaps']['byUniversalIdentifier'][string]
  >;
  derivedTabUniversalIdentifier: string;
  engineOwnedApplicationUniversalIdentifiers: Set<string>;
  twentyStandardApplicationUniversalIdentifier: string;
} & Pick<
  RecordPageStackMaps,
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatFieldMetadataMaps'
  | 'flatPageLayoutWidgetMaps'
>): void => {
  const seenDerivedWidgetUniversalIdentifiers = new Set<string>();

  for (const widgetUniversalIdentifier of flatPageLayoutTab.widgetUniversalIdentifiers) {
    const flatPageLayoutWidget =
      flatPageLayoutWidgetMaps.byUniversalIdentifier[widgetUniversalIdentifier];

    if (
      !isDefined(flatPageLayoutWidget) ||
      isDefined(flatPageLayoutWidget.deletedAt) ||
      !engineOwnedApplicationUniversalIdentifiers.has(
        flatPageLayoutWidget.applicationUniversalIdentifier,
      )
    ) {
      continue;
    }

    const derivedWidgetUniversalIdentifier =
      getPageLayoutWidgetUniversalIdentifier({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        pageLayoutTabUniversalIdentifier: derivedTabUniversalIdentifier,
        title: flatPageLayoutWidget.title,
      });

    if (
      seenDerivedWidgetUniversalIdentifiers.has(
        derivedWidgetUniversalIdentifier,
      )
    ) {
      logger.warn(
        `Duplicate widget title "${flatPageLayoutWidget.title}" on tab ${flatPageLayoutTab.id} in workspace ${workspaceId}, skipping widget ${flatPageLayoutWidget.id}`,
      );
      continue;
    }
    seenDerivedWidgetUniversalIdentifiers.add(derivedWidgetUniversalIdentifier);

    pushReownUpdate({
      workspaceId,
      logger,
      updates: reownUpdates.pageLayoutWidgetUpdates,
      flatEntity: flatPageLayoutWidget,
      derivedUniversalIdentifier: derivedWidgetUniversalIdentifier,
      flatEntitiesByUniversalIdentifier:
        flatPageLayoutWidgetMaps.byUniversalIdentifier,
    });

    if (
      flatPageLayoutWidget.configuration?.configurationType ===
      WidgetConfigurationType.FIELDS
    ) {
      computeRecordPageViewReownUpdates({
        workspaceId,
        logger,
        reownUpdates,
        flatObjectMetadata,
        fieldsWidgetViewId: flatPageLayoutWidget.configuration.viewId,
        twentyStandardApplicationUniversalIdentifier,
        flatViewMaps,
        flatViewFieldMaps,
        flatViewFieldGroupMaps,
        flatFieldMetadataMaps,
      });
    }
  }
};

const computeRecordPageViewReownUpdates = ({
  workspaceId,
  logger,
  reownUpdates,
  flatObjectMetadata,
  fieldsWidgetViewId,
  twentyStandardApplicationUniversalIdentifier,
  flatViewMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatFieldMetadataMaps,
}: {
  workspaceId: string;
  logger: ReownLogger;
  reownUpdates: RecordPageReownUpdates;
  flatObjectMetadata: ComputeRecordPageStackReownUpdatesArgs['flatObjectMetadata'];
  fieldsWidgetViewId: string | null;
  twentyStandardApplicationUniversalIdentifier: string;
} & Pick<
  RecordPageStackMaps,
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatFieldMetadataMaps'
>): void => {
  if (!isDefined(fieldsWidgetViewId)) {
    return;
  }

  const viewUniversalIdentifier =
    flatViewMaps.universalIdentifierById[fieldsWidgetViewId];
  const flatView = isDefined(viewUniversalIdentifier)
    ? flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]
    : undefined;

  if (!isDefined(flatView) || isDefined(flatView.deletedAt)) {
    logger.warn(
      `Dangling FIELDS widget view ${fieldsWidgetViewId} for object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId}, skipping`,
    );

    return;
  }

  const derivedViewUniversalIdentifier = getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      flatObjectMetadata.applicationUniversalIdentifier,
    objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    viewKey: ViewKey.FIELDS_WIDGET,
  });

  const alreadyProcessed = reownUpdates.viewUpdates.some(
    (viewUpdate) => viewUpdate.id === flatView.id,
  );

  if (alreadyProcessed) {
    return;
  }

  // The view identifier derives from the object alone, so a second view
  // reached through another FIELDS widget of the same stack cannot take it.
  const derivedViewIdentifierHolder =
    flatViewMaps.byUniversalIdentifier[derivedViewUniversalIdentifier];

  if (
    isDefined(derivedViewIdentifierHolder) &&
    derivedViewIdentifierHolder.id !== flatView.id
  ) {
    logger.warn(
      `Duplicate FIELDS widget view for object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId}, skipping view ${flatView.id}`,
    );

    return;
  }

  const viewUpdate: RecordPageReownUpdate['update'] = {};

  if (flatView.universalIdentifier !== derivedViewUniversalIdentifier) {
    viewUpdate.universalIdentifier = derivedViewUniversalIdentifier;
  }
  if (!flatView.isSystemSideEffect) {
    viewUpdate.isSystemSideEffect = true;
  }
  // The key backfill bypasses the compare pipeline (key is toCompare: false).
  if (flatView.key !== ViewKey.FIELDS_WIDGET) {
    viewUpdate.key = ViewKey.FIELDS_WIDGET;
  }

  if (Object.keys(viewUpdate).length > 0) {
    reownUpdates.viewUpdates.push({ id: flatView.id, update: viewUpdate });
  }

  const seenDerivedViewFieldUniversalIdentifiers = new Set<string>();

  for (const viewFieldUniversalIdentifier of flatView.viewFieldUniversalIdentifiers) {
    const flatViewField =
      flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier];

    if (!isDefined(flatViewField) || isDefined(flatViewField.deletedAt)) {
      continue;
    }

    const flatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        flatViewField.fieldMetadataUniversalIdentifier
      ];

    if (!isDefined(flatFieldMetadata)) {
      logger.warn(
        `Missing field for record-page view field ${flatViewField.id} in workspace ${workspaceId}, skipping`,
      );
      continue;
    }

    const derivedViewFieldUniversalIdentifier =
      getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          flatFieldMetadata.applicationUniversalIdentifier,
        viewUniversalIdentifier: derivedViewUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          flatViewField.fieldMetadataUniversalIdentifier,
      });

    if (
      seenDerivedViewFieldUniversalIdentifiers.has(
        derivedViewFieldUniversalIdentifier,
      )
    ) {
      logger.warn(
        `Duplicate view field for field ${flatViewField.fieldMetadataUniversalIdentifier} on record-page view ${flatView.id} in workspace ${workspaceId}, skipping view field ${flatViewField.id}`,
      );
      continue;
    }
    seenDerivedViewFieldUniversalIdentifiers.add(
      derivedViewFieldUniversalIdentifier,
    );

    pushReownUpdate({
      workspaceId,
      logger,
      updates: reownUpdates.viewFieldUpdates,
      flatEntity: flatViewField,
      derivedUniversalIdentifier: derivedViewFieldUniversalIdentifier,
      flatEntitiesByUniversalIdentifier:
        flatViewFieldMaps.byUniversalIdentifier,
    });
  }

  for (const viewFieldGroupUniversalIdentifier of flatView.viewFieldGroupUniversalIdentifiers) {
    const flatViewFieldGroup =
      flatViewFieldGroupMaps.byUniversalIdentifier[
        viewFieldGroupUniversalIdentifier
      ];

    if (
      !isDefined(flatViewFieldGroup) ||
      isDefined(flatViewFieldGroup.deletedAt) ||
      // User-created groups (CRUD API) keep isSystemSideEffect false and
      // their own identifier; only standard-authored groups are re-owned.
      flatViewFieldGroup.applicationUniversalIdentifier !==
        twentyStandardApplicationUniversalIdentifier
    ) {
      continue;
    }

    pushReownUpdate({
      workspaceId,
      logger,
      updates: reownUpdates.viewFieldGroupUpdates,
      flatEntity: flatViewFieldGroup,
      derivedUniversalIdentifier: getViewFieldGroupUniversalIdentifier({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        viewUniversalIdentifier: derivedViewUniversalIdentifier,
        name: flatViewFieldGroup.name,
      }),
      flatEntitiesByUniversalIdentifier:
        flatViewFieldGroupMaps.byUniversalIdentifier,
    });
  }
};

const pushReownUpdate = ({
  workspaceId,
  logger,
  updates,
  flatEntity,
  derivedUniversalIdentifier,
  flatEntitiesByUniversalIdentifier,
}: {
  workspaceId: string;
  logger: ReownLogger;
  updates: RecordPageReownUpdate[];
  flatEntity: {
    id: string;
    universalIdentifier: string;
    isSystemSideEffect: boolean;
  };
  derivedUniversalIdentifier: string;
  flatEntitiesByUniversalIdentifier: Record<string, { id: string } | undefined>;
}): void => {
  const update: RecordPageReownUpdate['update'] = {};

  if (flatEntity.universalIdentifier !== derivedUniversalIdentifier) {
    const derivedIdentifierHolder =
      flatEntitiesByUniversalIdentifier[derivedUniversalIdentifier];

    if (
      isDefined(derivedIdentifierHolder) &&
      derivedIdentifierHolder.id !== flatEntity.id
    ) {
      logger.warn(
        `Derived universal identifier ${derivedUniversalIdentifier} is already held by another row in workspace ${workspaceId}, skipping ${flatEntity.id}`,
      );

      return;
    }

    update.universalIdentifier = derivedUniversalIdentifier;
  }
  if (!flatEntity.isSystemSideEffect) {
    update.isSystemSideEffect = true;
  }

  if (Object.keys(update).length === 0) {
    return;
  }

  updates.push({ id: flatEntity.id, update });
};
