import { ViewVisibility } from 'twenty-shared/types';

import {
  APPLICATION_CONTENT_FLAT_ENTITY_MAPS_KEYS,
  type ApplicationContentFlatEntityMaps,
  buildApplicationContentFromFlatEntityMaps,
} from 'src/engine/core-modules/application/application-content/utils/build-application-content-from-flat-entity-maps.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const APPLICATION_ID = 'application-id';

const buildFlatView = (overrides: Partial<FlatView>) =>
  ({
    id: overrides.universalIdentifier,
    applicationId: APPLICATION_ID,
    name: overrides.universalIdentifier,
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    isSystemSideEffect: false,
    deletedAt: null,
    ...overrides,
  }) as FlatView;

const buildFlatViewField = (overrides: Partial<FlatViewField>) =>
  ({
    id: overrides.universalIdentifier,
    applicationId: APPLICATION_ID,
    fieldMetadataUniversalIdentifier: 'name',
    isSystemSideEffect: false,
    deletedAt: null,
    ...overrides,
  }) as FlatViewField;

const buildFlatEntityMaps = ({
  views,
  viewFields,
}: {
  views: FlatView[];
  viewFields: FlatViewField[];
}) => {
  const flatEntityMaps = Object.fromEntries(
    APPLICATION_CONTENT_FLAT_ENTITY_MAPS_KEYS.map((key) => [
      key,
      createEmptyFlatEntityMaps(),
    ]),
  ) as unknown as ApplicationContentFlatEntityMaps;

  flatEntityMaps.flatViewMaps = {
    ...createEmptyFlatEntityMaps(),
    byUniversalIdentifier: Object.fromEntries(
      views.map((view) => [view.universalIdentifier, view]),
    ),
    universalIdentifiersByApplicationId: {
      [APPLICATION_ID]: views.map((view) => view.universalIdentifier),
    },
  };
  flatEntityMaps.flatViewFieldMaps = {
    ...createEmptyFlatEntityMaps(),
    byUniversalIdentifier: Object.fromEntries(
      viewFields.map((viewField) => [viewField.universalIdentifier, viewField]),
    ),
    universalIdentifiersByApplicationId: {
      [APPLICATION_ID]: viewFields.map(
        (viewField) => viewField.universalIdentifier,
      ),
    },
  };

  return flatEntityMaps;
};

describe('buildApplicationContentFromFlatEntityMaps', () => {
  it('should leave out personal views and their view fields', () => {
    const content = buildApplicationContentFromFlatEntityMaps({
      applicationId: APPLICATION_ID,
      flatEntityMaps: buildFlatEntityMaps({
        views: [
          buildFlatView({ universalIdentifier: 'workspace-view' }),
          buildFlatView({
            universalIdentifier: 'app-unlisted-view',
            visibility: ViewVisibility.UNLISTED,
          }),
          buildFlatView({
            universalIdentifier: 'personal-view',
            visibility: ViewVisibility.UNLISTED,
            createdByUserWorkspaceId: 'user-workspace-id',
          }),
        ],
        viewFields: [
          buildFlatViewField({
            universalIdentifier: 'workspace-view-field',
            viewUniversalIdentifier: 'workspace-view',
          }),
          buildFlatViewField({
            universalIdentifier: 'personal-view-field',
            viewUniversalIdentifier: 'personal-view',
          }),
        ],
      }),
    });

    expect(content.views.map((view) => view.universalIdentifier)).toEqual([
      'workspace-view',
      'app-unlisted-view',
    ]);
    expect(
      content.viewFields.map((viewField) => viewField.universalIdentifier),
    ).toEqual(['workspace-view-field']);
  });

  it('should leave out soft-deleted entities', () => {
    const content = buildApplicationContentFromFlatEntityMaps({
      applicationId: APPLICATION_ID,
      flatEntityMaps: buildFlatEntityMaps({
        views: [
          buildFlatView({ universalIdentifier: 'workspace-view' }),
          buildFlatView({
            universalIdentifier: 'deleted-view',
            deletedAt: '2026-01-01T00:00:00.000Z',
          }),
        ],
        viewFields: [],
      }),
    });

    expect(content.views.map((view) => view.universalIdentifier)).toEqual([
      'workspace-view',
    ]);
  });
});
