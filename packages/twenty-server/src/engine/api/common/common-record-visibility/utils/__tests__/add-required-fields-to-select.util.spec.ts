import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { addRequiredFieldsToSelect } from 'src/engine/api/common/common-record-visibility/utils/add-required-fields-to-select.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const COMPANY_OBJECT = getFlatObjectMetadataMock({
  id: 'company-object-id',
  universalIdentifier: 'company-object-id',
  nameSingular: 'company',
  fieldIds: ['company-timeline-activities-field-id'],
});

const TIMELINE_ACTIVITY_OBJECT = getFlatObjectMetadataMock({
  id: 'timeline-activity-object-id',
  universalIdentifier: 'timeline-activity-object-id',
  nameSingular: 'timelineActivity',
  fieldIds: [],
});

const flatObjectMetadataMaps = [
  COMPANY_OBJECT,
  TIMELINE_ACTIVITY_OBJECT,
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatFieldMetadataMock({
    id: 'company-timeline-activities-field-id',
    universalIdentifier: 'company-timeline-activities-field-id',
    objectMetadataId: COMPANY_OBJECT.id,
    type: FieldMetadataType.RELATION,
    name: 'timelineActivities',
    relationTargetObjectMetadataId: TIMELINE_ACTIVITY_OBJECT.id,
    settings: { relationType: RelationType.ONE_TO_MANY },
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const resolveRequiredFieldNames = ({
  nameSingular,
}: {
  nameSingular: string;
}) => (nameSingular === 'timelineActivity' ? ['linkedObjectMetadataId'] : []);

describe('addRequiredFieldsToSelect', () => {
  it('should add the required fields to the root selection', () => {
    expect(
      addRequiredFieldsToSelect({
        select: { id: true, properties: true },
        flatObjectMetadata: TIMELINE_ACTIVITY_OBJECT,
        resolveRequiredFieldNames,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual({ id: true, properties: true, linkedObjectMetadataId: true });
  });

  it('should add the required fields to a nested relation selection', () => {
    expect(
      addRequiredFieldsToSelect({
        select: {
          id: true,
          timelineActivities: { id: true, properties: true },
        },
        flatObjectMetadata: COMPANY_OBJECT,
        resolveRequiredFieldNames,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual({
      id: true,
      timelineActivities: {
        id: true,
        properties: true,
        linkedObjectMetadataId: true,
      },
    });
  });
});
