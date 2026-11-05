import { compositeTypeDefinitions } from 'twenty-shared/types';

import { getWorkspaceApiSharedTypeNames } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-shared-type-names.util';

it('collects shared GraphQL type names without changing composite definitions', () => {
  const originalCompositeTypes = structuredClone([...compositeTypeDefinitions]);

  expect(getWorkspaceApiSharedTypeNames()).toEqual(
    expect.arrayContaining([
      'DateFilter',
      'ActorContext',
      'OrderByDirection',
      'FullNameCreateInput',
      'ActorSourceEnum',
      'ActorSourceEnumFilter',
    ]),
  );
  expect([...compositeTypeDefinitions]).toEqual(originalCompositeTypes);
});
