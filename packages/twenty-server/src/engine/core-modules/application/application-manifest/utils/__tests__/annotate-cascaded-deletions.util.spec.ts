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

const cascadeRootsOf = ({
  actions,
  cascadeDeletionParentByUniversalIdentifier,
}: {
  actions: ReturnType<typeof deletion>[];
  cascadeDeletionParentByUniversalIdentifier?: Record<string, string>;
}) =>
  Object.fromEntries(
    annotateCascadedDeletions({
      actions,
      cascadeDeletionParentByUniversalIdentifier,
    }).map((action) => [
      action.universalIdentifier,
      action.cascadedFromUniversalIdentifier,
    ]),
  );

describe('annotateCascadedDeletions', () => {
  it('points deletions the side-effect engine cascaded at their parent deletion', () => {
    expect(
      cascadeRootsOf({
        actions: [
          deletion({
            metadataName: 'fieldMetadata',
            universalIdentifier: 'tax-id',
            flatEntity: { objectMetadataUniversalIdentifier: 'company' },
          }),
          deletion({
            metadataName: 'pageLayoutWidget',
            universalIdentifier: 'tax-id-widget',
          }),
          deletion({
            metadataName: 'index',
            universalIdentifier: 'tax-id-index',
          }),
        ],
        cascadeDeletionParentByUniversalIdentifier: {
          'tax-id-widget': 'tax-id',
          'tax-id-index': 'tax-id',
        },
      }),
    ).toEqual({
      'tax-id': undefined,
      'tax-id-widget': 'tax-id',
      'tax-id-index': 'tax-id',
    });
  });

  it('follows cascade and required parents up to the root deletion', () => {
    expect(
      cascadeRootsOf({
        actions: [
          deletion({
            metadataName: 'objectMetadata',
            universalIdentifier: 'run',
          }),
          deletion({
            metadataName: 'fieldMetadata',
            universalIdentifier: 'run-name',
            flatEntity: { objectMetadataUniversalIdentifier: 'run' },
          }),
          deletion({ metadataName: 'view', universalIdentifier: 'run-view' }),
          deletion({
            metadataName: 'viewField',
            universalIdentifier: 'run-view-name',
            flatEntity: {
              viewUniversalIdentifier: 'run-view',
              fieldMetadataUniversalIdentifier: 'run-name',
            },
          }),
        ],
        cascadeDeletionParentByUniversalIdentifier: { 'run-view': 'run' },
      }),
    ).toEqual({
      run: undefined,
      'run-name': 'run',
      'run-view': 'run',
      'run-view-name': 'run',
    });
  });

  it('keeps a declared view that only refers to a deleted field', () => {
    expect(
      cascadeRootsOf({
        actions: [
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
        ],
      }),
    ).toEqual({ 'end-date': undefined, 'deal-calendar': undefined });
  });

  it('lists a deletion whose cascade parent is not deleted in the same migration', () => {
    expect(
      cascadeRootsOf({
        actions: [
          deletion({
            metadataName: 'pageLayoutWidget',
            universalIdentifier: 'widget',
          }),
        ],
        cascadeDeletionParentByUniversalIdentifier: { widget: 'updated-field' },
      }),
    ).toEqual({ widget: undefined });
  });

  it('leaves deletions that only point at each other listed', () => {
    expect(
      cascadeRootsOf({
        actions: [
          deletion({
            metadataName: 'fieldMetadata',
            universalIdentifier: 'left',
          }),
          deletion({
            metadataName: 'fieldMetadata',
            universalIdentifier: 'right',
          }),
        ],
        cascadeDeletionParentByUniversalIdentifier: {
          left: 'right',
          right: 'left',
        },
      }),
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

    expect(annotateCascadedDeletions({ actions })).toEqual(actions);
  });
});
