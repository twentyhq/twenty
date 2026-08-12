import {
  SYSTEM_VIEW_KEYS,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemPageLayoutWidgetUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getSystemViewFieldGroupUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { PRE_2_31_RECORD_PAGE_UNIVERSAL_IDENTIFIER_BY_DERIVED } from 'src/database/commands/upgrade-version-command/2-10/utils/remap-record-page-universal-identifiers-to-pre-2-31.util';
import {
  type RecordPageReownUpdate,
  type RecordPageReownUpdates,
} from 'src/database/commands/upgrade-version-command/2-31/types/record-page-reown-updates.type';
import {
  collectRecordPageStackTree,
  type RecordPageStackFieldsViewNode,
} from 'src/database/commands/upgrade-version-command/2-31/utils/collect-record-page-stack-tree.util';
import { createEmptyRecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-31/utils/create-empty-record-page-reown-updates.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type ReownLogger = { warn: (message: string) => void };

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

  const stackTree = collectRecordPageStackTree({
    flatPageLayout,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
  });

  pushReownUpdate({
    workspaceId,
    logger,
    updates: reownUpdates.pageLayoutUpdates,
    flatEntity: flatPageLayout,
    derivedUniversalIdentifier: derivedPageLayoutUniversalIdentifier,
    flatEntitiesByUniversalIdentifier: flatPageLayoutMaps.byUniversalIdentifier,
  });

  const systemFieldsViewId = selectSystemFieldsViewId({
    workspaceId,
    logger,
    stackTree,
    flatObjectMetadata,
    engineOwnedApplicationUniversalIdentifiers,
    twentyStandardApplicationUniversalIdentifier,
  });

  const seenDerivedTabUniversalIdentifiers = new Set<string>();
  const processedViewIds = new Set<string>();

  for (const { flatPageLayoutTab, widgets } of stackTree.tabs) {
    if (
      // App-authored tabs attached to the engine layout stay app-owned.
      !engineOwnedApplicationUniversalIdentifiers.has(
        flatPageLayoutTab.applicationUniversalIdentifier,
      )
    ) {
      continue;
    }

    const derivedTabUniversalIdentifier =
      getSystemPageLayoutTabUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
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

    const seenDerivedWidgetUniversalIdentifiers = new Set<string>();

    for (const {
      flatPageLayoutWidget,
      fieldsWidgetViewId,
      fieldsView,
    } of widgets) {
      if (
        !engineOwnedApplicationUniversalIdentifiers.has(
          flatPageLayoutWidget.applicationUniversalIdentifier,
        )
      ) {
        continue;
      }

      const derivedWidgetUniversalIdentifier =
        getSystemPageLayoutWidgetUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
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
      seenDerivedWidgetUniversalIdentifiers.add(
        derivedWidgetUniversalIdentifier,
      );

      pushReownUpdate({
        workspaceId,
        logger,
        updates: reownUpdates.pageLayoutWidgetUpdates,
        flatEntity: flatPageLayoutWidget,
        derivedUniversalIdentifier: derivedWidgetUniversalIdentifier,
        flatEntitiesByUniversalIdentifier:
          flatPageLayoutWidgetMaps.byUniversalIdentifier,
      });

      if (isDefined(fieldsWidgetViewId) && !isDefined(fieldsView)) {
        logger.warn(
          `Dangling FIELDS widget view ${fieldsWidgetViewId} for object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      if (
        !isDefined(fieldsView) ||
        // Only the selected system view is re-owned: any other FIELDS widget
        // view (e.g. user-added through layout customization) would derive
        // the same object-based identifier and self-collide at apply time,
        // and is user-space anyway.
        fieldsView.flatView.id !== systemFieldsViewId ||
        processedViewIds.has(fieldsView.flatView.id)
      ) {
        continue;
      }
      processedViewIds.add(fieldsView.flatView.id);

      computeRecordPageViewReownUpdates({
        workspaceId,
        logger,
        reownUpdates,
        flatObjectMetadata,
        fieldsView,
        twentyStandardApplicationUniversalIdentifier,
        flatViewMaps,
        flatViewFieldMaps,
        flatViewFieldGroupMaps,
        flatFieldMetadataMaps,
      });
    }
  }

  return reownUpdates;
};

// One system FIELDS_WIDGET view per object: resolve it by identifier first
// (the pre-2.31 pinned literal for standard objects, then the derived
// identifier on reruns), then by the twenty-standard-owned widget reference,
// then by the isSystemSideEffect flag (post-2-15 custom objects, whose
// engine view is flagged while user-added views never are). A lone leftover
// candidate wins by elimination; several leftovers (pre-2-15 custom rows are
// stuck unflagged, so an added user view is indistinguishable) are ambiguous
// and selection is refused with a warning rather than scored, matching the
// layout decision table: the backfill provisions the derived stack next and
// the untouched views keep working as user-space customs. Every
// non-selected FIELDS widget view reached through the layout is user-space
// and must not be re-owned.
const selectSystemFieldsViewId = ({
  workspaceId,
  logger,
  stackTree,
  flatObjectMetadata,
  engineOwnedApplicationUniversalIdentifiers,
  twentyStandardApplicationUniversalIdentifier,
}: {
  workspaceId: string;
  logger: ReownLogger;
  stackTree: ReturnType<typeof collectRecordPageStackTree>;
  flatObjectMetadata: ComputeRecordPageStackReownUpdatesArgs['flatObjectMetadata'];
  engineOwnedApplicationUniversalIdentifiers: Set<string>;
  twentyStandardApplicationUniversalIdentifier: string;
}): string | undefined => {
  const derivedViewUniversalIdentifier = getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      flatObjectMetadata.applicationUniversalIdentifier,
    objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    viewKey: SYSTEM_VIEW_KEYS.FIELDS_WIDGET,
  });
  const pre231ViewUniversalIdentifier =
    PRE_2_31_RECORD_PAGE_UNIVERSAL_IDENTIFIER_BY_DERIVED[
      derivedViewUniversalIdentifier
    ];

  const candidates: {
    fieldsView: RecordPageStackFieldsViewNode;
    widgetApplicationUniversalIdentifier: string;
  }[] = [];
  const seenCandidateViewIds = new Set<string>();

  for (const { flatPageLayoutTab, widgets } of stackTree.tabs) {
    if (
      !engineOwnedApplicationUniversalIdentifiers.has(
        flatPageLayoutTab.applicationUniversalIdentifier,
      )
    ) {
      continue;
    }

    for (const { flatPageLayoutWidget, fieldsView } of widgets) {
      if (
        !engineOwnedApplicationUniversalIdentifiers.has(
          flatPageLayoutWidget.applicationUniversalIdentifier,
        ) ||
        !isDefined(fieldsView) ||
        seenCandidateViewIds.has(fieldsView.flatView.id)
      ) {
        continue;
      }
      seenCandidateViewIds.add(fieldsView.flatView.id);

      candidates.push({
        fieldsView,
        widgetApplicationUniversalIdentifier:
          flatPageLayoutWidget.applicationUniversalIdentifier,
      });
    }
  }

  const selectedCandidate =
    candidates.find(
      ({ fieldsView }) =>
        isDefined(pre231ViewUniversalIdentifier) &&
        fieldsView.flatView.universalIdentifier ===
          pre231ViewUniversalIdentifier,
    ) ??
    candidates.find(
      ({ fieldsView }) =>
        fieldsView.flatView.universalIdentifier ===
        derivedViewUniversalIdentifier,
    ) ??
    candidates.find(
      ({ widgetApplicationUniversalIdentifier }) =>
        widgetApplicationUniversalIdentifier ===
        twentyStandardApplicationUniversalIdentifier,
    ) ??
    candidates.find(({ fieldsView }) => fieldsView.flatView.isSystemSideEffect);

  if (isDefined(selectedCandidate)) {
    return selectedCandidate.fieldsView.flatView.id;
  }

  if (candidates.length > 1) {
    logger.warn(
      `Ambiguous FIELDS widget views for object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId}, skipping view re-own (candidates: ${candidates
        .map(({ fieldsView }) => fieldsView.flatView.id)
        .join(', ')})`,
    );

    return undefined;
  }

  return candidates[0]?.fieldsView.flatView.id;
};

const computeRecordPageViewReownUpdates = ({
  workspaceId,
  logger,
  reownUpdates,
  flatObjectMetadata,
  fieldsView,
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
  fieldsView: RecordPageStackFieldsViewNode;
  twentyStandardApplicationUniversalIdentifier: string;
} & Pick<
  RecordPageStackMaps,
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatFieldMetadataMaps'
>): void => {
  const { flatView, flatViewFields, flatViewFieldGroups } = fieldsView;

  const derivedViewUniversalIdentifier = getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      flatObjectMetadata.applicationUniversalIdentifier,
    objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    viewKey: SYSTEM_VIEW_KEYS.FIELDS_WIDGET,
  });

  // Only the selected system view reaches this point, so a holder here is a
  // row outside the walk (e.g. a soft-deleted view still occupying the
  // identifier in the non-partial unique index).
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

  if (Object.keys(viewUpdate).length > 0) {
    reownUpdates.viewUpdates.push({ id: flatView.id, update: viewUpdate });
  }

  const seenDerivedViewFieldUniversalIdentifiers = new Set<string>();

  for (const flatViewField of flatViewFields) {
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

  const seenDerivedViewFieldGroupUniversalIdentifiers = new Set<string>();

  for (const flatViewFieldGroup of flatViewFieldGroups) {
    if (
      // User-created groups (CRUD API) keep isSystemSideEffect false and
      // their own identifier; only standard-authored groups are re-owned.
      flatViewFieldGroup.applicationUniversalIdentifier !==
      twentyStandardApplicationUniversalIdentifier
    ) {
      continue;
    }

    const derivedViewFieldGroupUniversalIdentifier =
      getSystemViewFieldGroupUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        viewUniversalIdentifier: derivedViewUniversalIdentifier,
        name: flatViewFieldGroup.name,
      });

    if (
      seenDerivedViewFieldGroupUniversalIdentifiers.has(
        derivedViewFieldGroupUniversalIdentifier,
      )
    ) {
      logger.warn(
        `Duplicate view field group name "${flatViewFieldGroup.name}" on record-page view ${flatView.id} in workspace ${workspaceId}, skipping group ${flatViewFieldGroup.id}`,
      );
      continue;
    }
    seenDerivedViewFieldGroupUniversalIdentifiers.add(
      derivedViewFieldGroupUniversalIdentifier,
    );

    pushReownUpdate({
      workspaceId,
      logger,
      updates: reownUpdates.viewFieldGroupUpdates,
      flatEntity: flatViewFieldGroup,
      derivedUniversalIdentifier: derivedViewFieldGroupUniversalIdentifier,
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
