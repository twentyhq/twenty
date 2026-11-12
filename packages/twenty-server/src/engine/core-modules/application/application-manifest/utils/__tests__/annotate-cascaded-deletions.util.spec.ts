import { type AllMetadataName } from 'twenty-shared/metadata';

import { annotateCascadedDeletions } from 'src/engine/core-modules/application/application-manifest/utils/annotate-cascaded-deletions.util';

const deletion = ({
  metadataName,
  universalIdentifier,
  flatEntity = {},
}: {
  metadataName: AllMetadataName;
  universalIdentifier: string;
  flatEntity?: Record<string, unknown>;
}) => ({ type: 'delete', metadataName, universalIdentifier, flatEntity });

const cascadeRootsOf = (actions: ReturnType<typeof deletion>[]) =>
  Object.fromEntries(
    annotateCascadedDeletions(actions).map((action) => [
      action.universalIdentifier,
      action.cascadedFromUniversalIdentifier,
    ]),
  );

describe('annotateCascadedDeletions', () => {
  it('points everything removed with an object at the object deletion', () => {
    expect(
      cascadeRootsOf([
        deletion({
          metadataName: 'objectMetadata',
          universalIdentifier: 'run',
        }),
        deletion({
          metadataName: 'fieldMetadata',
          universalIdentifier: 'run-name',
          flatEntity: { objectMetadataUniversalIdentifier: 'run' },
        }),
        deletion({
          metadataName: 'fieldMetadata',
          universalIdentifier: 'note-target-run',
          flatEntity: {
            isSystemSideEffect: true,
            objectMetadataUniversalIdentifier: 'note-target',
            relationTargetObjectMetadataUniversalIdentifier: 'run',
          },
        }),
        deletion({
          metadataName: 'view',
          universalIdentifier: 'run-view',
          flatEntity: { objectMetadataUniversalIdentifier: 'run' },
        }),
        deletion({
          metadataName: 'viewField',
          universalIdentifier: 'run-view-name',
          flatEntity: {
            viewUniversalIdentifier: 'run-view',
            fieldMetadataUniversalIdentifier: 'run-name',
          },
        }),
        deletion({
          metadataName: 'pageLayout',
          universalIdentifier: 'run-layout',
          flatEntity: {
            isSystemSideEffect: true,
            objectMetadataUniversalIdentifier: 'run',
          },
        }),
        deletion({
          metadataName: 'pageLayoutTab',
          universalIdentifier: 'run-tab',
          flatEntity: { pageLayoutUniversalIdentifier: 'run-layout' },
        }),
      ]),
    ).toEqual({
      run: undefined,
      'run-name': 'run',
      'note-target-run': 'run',
      'run-view': 'run',
      'run-view-name': 'run',
      'run-layout': 'run',
      'run-tab': 'run',
    });
  });

  it('folds a generated widget and index into the field they point at', () => {
    expect(
      cascadeRootsOf([
        deletion({
          metadataName: 'fieldMetadata',
          universalIdentifier: 'tax-id',
          flatEntity: { objectMetadataUniversalIdentifier: 'company' },
        }),
        deletion({
          metadataName: 'pageLayoutWidget',
          universalIdentifier: 'tax-id-widget',
          flatEntity: {
            isSystemSideEffect: true,
            pageLayoutTabUniversalIdentifier: 'company-tab',
            universalConfiguration: {
              configurationType: 'FORM_FIELD',
              fieldMetadataId: 'tax-id',
            },
          },
        }),
        deletion({
          metadataName: 'index',
          universalIdentifier: 'tax-id-index',
          flatEntity: {
            isSystemSideEffect: true,
            objectMetadataUniversalIdentifier: 'company',
            universalFlatIndexFieldMetadatas: [
              { order: 0, fieldMetadataUniversalIdentifier: 'tax-id' },
            ],
          },
        }),
      ]),
    ).toEqual({
      'tax-id': undefined,
      'tax-id-widget': 'tax-id',
      'tax-id-index': 'tax-id',
    });
  });

  it('keeps a declared view that only refers to a deleted field', () => {
    expect(
      cascadeRootsOf([
        deletion({
          metadataName: 'fieldMetadata',
          universalIdentifier: 'end-date',
          flatEntity: { objectMetadataUniversalIdentifier: 'deal' },
        }),
        deletion({
          metadataName: 'view',
          universalIdentifier: 'deal-calendar',
          flatEntity: {
            objectMetadataUniversalIdentifier: 'deal',
            calendarEndFieldMetadataUniversalIdentifier: 'end-date',
          },
        }),
      ]),
    ).toEqual({ 'end-date': undefined, 'deal-calendar': undefined });
  });

  it('folds the generated inverse of a deleted relation field, not the reverse', () => {
    expect(
      cascadeRootsOf([
        deletion({
          metadataName: 'fieldMetadata',
          universalIdentifier: 'company-people',
          flatEntity: {
            objectMetadataUniversalIdentifier: 'company',
            relationTargetFieldMetadataUniversalIdentifier: 'person-company',
          },
        }),
        deletion({
          metadataName: 'fieldMetadata',
          universalIdentifier: 'person-company',
          flatEntity: {
            isSystemSideEffect: true,
            objectMetadataUniversalIdentifier: 'person',
            relationTargetFieldMetadataUniversalIdentifier: 'company-people',
          },
        }),
      ]),
    ).toEqual({
      'company-people': undefined,
      'person-company': 'company-people',
    });
  });

  it('leaves generated entities that only point at each other listed', () => {
    expect(
      cascadeRootsOf([
        deletion({
          metadataName: 'fieldMetadata',
          universalIdentifier: 'left',
          flatEntity: {
            isSystemSideEffect: true,
            relationTargetFieldMetadataUniversalIdentifier: 'right',
          },
        }),
        deletion({
          metadataName: 'fieldMetadata',
          universalIdentifier: 'right',
          flatEntity: {
            isSystemSideEffect: true,
            relationTargetFieldMetadataUniversalIdentifier: 'left',
          },
        }),
      ]),
    ).toEqual({ left: undefined, right: undefined });
  });

  it('leaves creates and updates untouched', () => {
    const actions = [
      { type: 'create', metadataName: 'objectMetadata' as const },
      {
        type: 'update',
        metadataName: 'fieldMetadata' as const,
        universalIdentifier: 'field',
        flatEntity: { objectMetadataUniversalIdentifier: 'object' },
      },
    ];

    expect(annotateCascadedDeletions(actions)).toEqual(actions);
  });
});
