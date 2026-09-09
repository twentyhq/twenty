import {
  getSeededObjectViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';

import { computeSeedObjectDefaultViewOperations } from 'src/database/commands/upgrade-version-command/2-40/utils/compute-seed-object-default-view-operations.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '5f4a1c1e-0000-4000-8000-000000000001';
const PET_OBJECT_UNIVERSAL_IDENTIFIER = '5f4a1c1e-0000-4000-8000-000000000002';
const PET_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  '5f4a1c1e-0000-4000-8000-000000000003';
const NAME_FIELD_UNIVERSAL_IDENTIFIER = '5f4a1c1e-0000-4000-8000-000000000004';
const AGE_FIELD_UNIVERSAL_IDENTIFIER = '5f4a1c1e-0000-4000-8000-000000000005';
const NAME_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '5f4a1c1e-0000-4000-8000-000000000006';
const AGE_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '5f4a1c1e-0000-4000-8000-000000000007';

const SEEDED_VIEW_UNIVERSAL_IDENTIFIER = getSeededObjectViewUniversalIdentifier(
  {
    objectMetadataApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: PET_OBJECT_UNIVERSAL_IDENTIFIER,
  },
);

type ObjectFixture = {
  universalIdentifier: string;
  labelPlural: string;
  isRemote: boolean;
};

type ViewFixture = {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  key: string | null;
  deletedAt: string | null;
  viewFieldUniversalIdentifiers: string[];
};

type ViewFieldFixture = {
  universalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  viewFieldGroupUniversalIdentifier: string | null;
  isVisible: boolean;
  size: number;
  position: number;
  aggregateOperation: string | null;
  isActive: boolean;
  isSystemSideEffect: boolean;
  universalOverrides: null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  applicationUniversalIdentifier: string;
};

const PET_OBJECT: ObjectFixture = {
  universalIdentifier: PET_OBJECT_UNIVERSAL_IDENTIFIER,
  labelPlural: 'Pets',
  isRemote: false,
};

const PET_INDEX_VIEW: ViewFixture = {
  universalIdentifier: PET_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: PET_OBJECT_UNIVERSAL_IDENTIFIER,
  key: ViewKey.INDEX,
  deletedAt: null,
  viewFieldUniversalIdentifiers: [
    NAME_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    AGE_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  ],
};

const buildIndexViewFieldFixture = ({
  universalIdentifier,
  fieldMetadataUniversalIdentifier,
  position,
}: {
  universalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  position: number;
}): ViewFieldFixture => ({
  universalIdentifier,
  fieldMetadataUniversalIdentifier,
  viewUniversalIdentifier: PET_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier: null,
  isVisible: true,
  size: 180,
  position,
  aggregateOperation: null,
  isActive: true,
  isSystemSideEffect: true,
  universalOverrides: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  applicationUniversalIdentifier: 'some-standard-application',
});

const buildMaps = ({
  objects,
  views,
  viewFields,
}: {
  objects: ObjectFixture[];
  views: ViewFixture[];
  viewFields: ViewFieldFixture[];
}) =>
  ({
    flatObjectMetadataMaps: {
      byUniversalIdentifier: Object.fromEntries(
        objects.map((object) => [object.universalIdentifier, object]),
      ),
    },
    flatViewMaps: {
      byUniversalIdentifier: Object.fromEntries(
        views.map((view) => [view.universalIdentifier, view]),
      ),
    },
    flatViewFieldMaps: {
      byUniversalIdentifier: Object.fromEntries(
        viewFields.map((viewField) => [viewField.universalIdentifier, viewField]),
      ),
    },
  }) as unknown as Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatViewMaps' | 'flatViewFieldMaps'
  >;

const NAME_INDEX_VIEW_FIELD = buildIndexViewFieldFixture({
  universalIdentifier: NAME_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  position: 0,
});

const AGE_INDEX_VIEW_FIELD = buildIndexViewFieldFixture({
  universalIdentifier: AGE_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: AGE_FIELD_UNIVERSAL_IDENTIFIER,
  position: 1,
});

describe('computeSeedObjectDefaultViewOperations', () => {
  it('seeds one view and copies the INDEX layout for an unseeded object', () => {
    const { viewsToCreate, viewFieldsToCreate } =
      computeSeedObjectDefaultViewOperations({
        ...buildMaps({
          objects: [PET_OBJECT],
          views: [PET_INDEX_VIEW],
          viewFields: [NAME_INDEX_VIEW_FIELD, AGE_INDEX_VIEW_FIELD],
        }),
        seededViewApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    expect(viewsToCreate).toHaveLength(1);
    expect(viewsToCreate[0]).toMatchObject({
      universalIdentifier: SEEDED_VIEW_UNIVERSAL_IDENTIFIER,
      name: 'All Pets',
      key: ViewKey.DEFAULT,
      isSystemSideEffect: false,
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(viewFieldsToCreate).toHaveLength(2);
    expect(viewFieldsToCreate.map((viewField) => viewField.position)).toEqual([
      0, 1,
    ]);
    expect(viewFieldsToCreate[0]).toMatchObject({
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewUniversalIdentifier: SEEDED_VIEW_UNIVERSAL_IDENTIFIER,
      isSystemSideEffect: false,
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: getViewFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: SEEDED_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    });
    expect(
      viewFieldsToCreate.every(
        (viewField) =>
          viewField.universalIdentifier !==
            NAME_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER &&
          viewField.universalIdentifier !==
            AGE_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      ),
    ).toBe(true);
  });

  it('creates only the missing view fields when the seeded view already exists (partial-run recovery)', () => {
    const seededNameViewFieldUniversalIdentifier =
      getViewFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: SEEDED_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      });

    const existingSeededView: ViewFixture = {
      universalIdentifier: SEEDED_VIEW_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: PET_OBJECT_UNIVERSAL_IDENTIFIER,
      key: ViewKey.DEFAULT,
      deletedAt: null,
      viewFieldUniversalIdentifiers: [seededNameViewFieldUniversalIdentifier],
    };

    const { viewsToCreate, viewFieldsToCreate } =
      computeSeedObjectDefaultViewOperations({
        ...buildMaps({
          objects: [PET_OBJECT],
          views: [PET_INDEX_VIEW, existingSeededView],
          viewFields: [NAME_INDEX_VIEW_FIELD, AGE_INDEX_VIEW_FIELD],
        }),
        seededViewApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    expect(viewsToCreate).toHaveLength(0);
    expect(viewFieldsToCreate).toHaveLength(1);
    expect(viewFieldsToCreate[0].fieldMetadataUniversalIdentifier).toBe(
      AGE_FIELD_UNIVERSAL_IDENTIFIER,
    );
  });

  it('produces nothing for a fully seeded object', () => {
    const existingSeededView: ViewFixture = {
      universalIdentifier: SEEDED_VIEW_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: PET_OBJECT_UNIVERSAL_IDENTIFIER,
      key: ViewKey.DEFAULT,
      deletedAt: null,
      viewFieldUniversalIdentifiers: [
        NAME_FIELD_UNIVERSAL_IDENTIFIER,
        AGE_FIELD_UNIVERSAL_IDENTIFIER,
      ].map((fieldMetadataUniversalIdentifier) =>
        getViewFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: SEEDED_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier,
        }),
      ),
    };

    const { viewsToCreate, viewFieldsToCreate } =
      computeSeedObjectDefaultViewOperations({
        ...buildMaps({
          objects: [PET_OBJECT],
          views: [PET_INDEX_VIEW, existingSeededView],
          viewFields: [NAME_INDEX_VIEW_FIELD, AGE_INDEX_VIEW_FIELD],
        }),
        seededViewApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    expect(viewsToCreate).toHaveLength(0);
    expect(viewFieldsToCreate).toHaveLength(0);
  });

  it('skips objects without a live INDEX view and remote objects', () => {
    const remoteObject: ObjectFixture = {
      universalIdentifier: '5f4a1c1e-0000-4000-8000-000000000008',
      labelPlural: 'Remotes',
      isRemote: true,
    };
    const objectWithoutIndexView: ObjectFixture = {
      universalIdentifier: '5f4a1c1e-0000-4000-8000-000000000009',
      labelPlural: 'Orphans',
      isRemote: false,
    };

    const { viewsToCreate, viewFieldsToCreate } =
      computeSeedObjectDefaultViewOperations({
        ...buildMaps({
          objects: [remoteObject, objectWithoutIndexView],
          views: [],
          viewFields: [],
        }),
        seededViewApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    expect(viewsToCreate).toHaveLength(0);
    expect(viewFieldsToCreate).toHaveLength(0);
  });
});
