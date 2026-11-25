import { ViewType } from 'twenty-shared/types';
import { getViewLayoutFromViewType, isDefined } from 'twenty-shared/utils';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { fromViewOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view/utils/from-view-overrides-to-universal-overrides.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/overrides/utils/sanitize-overridable-entity-input.util';

type CompactableFlatView = Pick<
  FlatView,
  | 'type'
  | 'isCompact'
  | 'overrides'
  | 'universalOverrides'
  | 'applicationUniversalIdentifier'
  | 'isSystemSideEffect'
  | 'updatedAt'
>;

type CompactListFlatViewUpdate<TFlatView extends CompactableFlatView> = {
  flatView: TFlatView;
  writerApplicationUniversalIdentifier: string;
};

const isListLayout = (viewType: ViewType): boolean =>
  getViewLayoutFromViewType(viewType) === ViewType.LIST;

export const buildCompactListFlatViewUpdates = <
  TFlatView extends CompactableFlatView,
>({
  flatViews,
  fieldMetadataUniversalIdentifierById,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  flatViews: TFlatView[];
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
}): CompactListFlatViewUpdate<TFlatView>[] =>
  flatViews.flatMap((flatView) => {
    const effectiveFlatView = resolveEffectiveFlatEntity({
      metadataName: 'view',
      flatEntity: flatView,
      authorContext: { workspaceCustomApplicationUniversalIdentifier },
    });

    const isNonCompactList =
      isListLayout(effectiveFlatView.type) && !effectiveFlatView.isCompact;

    if (!isNonCompactList) {
      return [];
    }

    if (isListLayout(flatView.type)) {
      return [
        {
          flatView: { ...flatView, isCompact: true, updatedAt: now },
          writerApplicationUniversalIdentifier:
            flatView.applicationUniversalIdentifier,
        },
      ];
    }

    const { overrides, updatedEditableProperties } =
      sanitizeOverridableEntityInput({
        metadataName: 'view',
        existingFlatEntity: flatView,
        updatedEditableProperties: { isCompact: true },
        shouldOverride: isCallerOverridingEntity({
          callerApplicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          entityApplicationUniversalIdentifier:
            flatView.applicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
          isSystemSideEffect: flatView.isSystemSideEffect,
        }),
        callerApplicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier,
      });

    return [
      {
        flatView: {
          ...flatView,
          ...updatedEditableProperties,
          overrides,
          universalOverrides: isDefined(overrides)
            ? fromViewOverridesToUniversalOverrides({
                overrides,
                fieldMetadataUniversalIdentifierById,
                shouldThrowOnMissingIdentifier: false,
              })
            : null,
          updatedAt: now,
        },
        writerApplicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
      },
    ];
  });
