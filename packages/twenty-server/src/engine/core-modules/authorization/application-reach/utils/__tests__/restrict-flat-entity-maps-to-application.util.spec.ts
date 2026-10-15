import { restrictFlatEntityMapsToApplication } from 'src/engine/core-modules/authorization/application-reach/utils/restrict-flat-entity-maps-to-application.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const buildFlatLogicFunction = (id: string, applicationId: string) =>
  ({
    id,
    universalIdentifier: `${id}-uid`,
    applicationId,
  }) as FlatLogicFunction;

const ownFunction = buildFlatLogicFunction('own', 'own-application-id');
const otherFunction = buildFlatLogicFunction('other', 'other-application-id');

const flatEntityMaps: FlatEntityMaps<FlatLogicFunction> = {
  byUniversalIdentifier: {
    [ownFunction.universalIdentifier]: ownFunction,
    [otherFunction.universalIdentifier]: otherFunction,
  },
  universalIdentifierById: {
    [ownFunction.id]: ownFunction.universalIdentifier,
    [otherFunction.id]: otherFunction.universalIdentifier,
  },
  universalIdentifiersByApplicationId: {
    'own-application-id': [ownFunction.universalIdentifier],
    'other-application-id': [otherFunction.universalIdentifier],
  },
};

describe('restrictFlatEntityMapsToApplication', () => {
  const restricted = restrictFlatEntityMapsToApplication({
    flatEntityMaps,
    applicationId: 'own-application-id',
  });

  it('should keep the application own entities findable by id', () => {
    expect(
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: ownFunction.id,
        flatEntityMaps: restricted,
      }),
    ).toBe(ownFunction);
  });

  it('should leave out the entities of other applications', () => {
    expect(
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: otherFunction.id,
        flatEntityMaps: restricted,
      }),
    ).toBeUndefined();
    expect(Object.values(restricted.byUniversalIdentifier)).toEqual([
      ownFunction,
    ]);
    expect(restricted.universalIdentifiersByApplicationId).toEqual({
      'own-application-id': [ownFunction.universalIdentifier],
    });
  });

  it('should not change the cached maps', () => {
    expect(Object.keys(flatEntityMaps.byUniversalIdentifier)).toHaveLength(2);
  });
});
