import { isNonEmptyArray } from '@sniptt/guards';
import { renderHook } from '@testing-library/react';

import { Company } from '@/companies/types/Company';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import {
  companiesConnectionWithPeopleConnectionWithFavoritesConnectionMock,
  emptyConnectionMock,
  peopleWithTheirUniqueCompanies,
} from '@/object-record/hooks/__mocks__/useMapConnectionToRecords';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
import { Person } from '@/people/types/Person';
import { getJestHookWrapper } from '~/testing/jest/getJestHookWrapper';
import { isDefined } from '~/utils/isDefined';

const Wrapper = getJestHookWrapper({
  apolloMocks: [],
  onInitializeRecoilSnapshot: (snapshot) => {
    snapshot.set(objectMetadataItemsState, getObjectMetadataItemsMock());
  },
});

describe('useMapConnectionToRecords', () => {
  it('Empty edges - should return an empty array if no edge', async () => {
    const { result } = renderHook(
      () => {
        const mapConnectionToRecords = useMapConnectionToRecords();

        const records = mapConnectionToRecords({
          objectNameSingular: CoreObjectNameSingular.Company,
          objectRecordConnection: emptyConnectionMock,
          depth: 5,
        });

        return records;
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(Array.isArray(result.current)).toBe(true);
  });

  it('No relation fields - should return an array of company records', async () => {
    const { result } = renderHook(
      () => {
        const mapConnectionToRecords = useMapConnectionToRecords();

        const records = mapConnectionToRecords({
          objectNameSingular: CoreObjectNameSingular.Company,
          objectRecordConnection:
            companiesConnectionWithPeopleConnectionWithFavoritesConnectionMock,
          depth: 5,
        });

        return records;
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(Array.isArray(result.current)).toBe(true);
  });

  it('n+1 relation fields - should return an array of company records with their people records', async () => {
    const { result } = renderHook(
      () => {
        const mapConnectionToRecords = useMapConnectionToRecords();

        const records = mapConnectionToRecords({
          objectNameSingular: CoreObjectNameSingular.Company,
          objectRecordConnection:
            companiesConnectionWithPeopleConnectionWithFavoritesConnectionMock,
          depth: 5,
        });

        return records;
      },
      {
        wrapper: Wrapper,
      },
    );

    const secondCompanyMock =
      companiesConnectionWithPeopleConnectionWithFavoritesConnectionMock
        .edges[1];

    const secondCompanyPeopleMock = secondCompanyMock.node.people.edges.map(
      (edge) => edge.node,
    );

    const companiesResult = result.current;
    const secondCompanyResult = result.current[1];
    const secondCompanyPeopleResult = secondCompanyResult.people;

    expect(isNonEmptyArray(companiesResult)).toBe(true);
    expect(secondCompanyResult.id).toBe(secondCompanyMock.node.id);
    expect(isNonEmptyArray(secondCompanyPeopleResult)).toBe(true);
    expect(secondCompanyPeopleResult[0].id).toEqual(
      secondCompanyPeopleMock[0].id,
    );
  });

  it('n+2 relation fields - should return an array of company records with their people records with their favorites records', async () => {
    const { result } = renderHook(
      () => {
        const mapConnectionToRecords = useMapConnectionToRecords();

        const records = mapConnectionToRecords({
          objectNameSingular: CoreObjectNameSingular.Company,
          objectRecordConnection:
            companiesConnectionWithPeopleConnectionWithFavoritesConnectionMock,
          depth: 5,
        });

        return records;
      },
      {
        wrapper: Wrapper,
      },
    );

    const secondCompanyMock =
      companiesConnectionWithPeopleConnectionWithFavoritesConnectionMock
        .edges[1];

    const secondCompanyPeopleMock = secondCompanyMock.node.people;

    const secondCompanyFirstPersonMock = secondCompanyPeopleMock.edges[0].node;

    const secondCompanyFirstPersonFavoritesMock =
      secondCompanyFirstPersonMock.favorites;

    const companiesResult = result.current;
    const secondCompanyResult = companiesResult[1];
    const secondCompanyPeopleResult = secondCompanyResult.people;
    const secondCompanyFirstPersonResult = secondCompanyPeopleResult[0];
    const secondCompanyFirstPersonFavoritesResult =
      secondCompanyFirstPersonResult.favorites;

    expect(isNonEmptyArray(companiesResult)).toBe(true);
    expect(secondCompanyResult.id).toBe(secondCompanyMock.node.id);
    expect(isNonEmptyArray(secondCompanyPeopleResult)).toBe(true);
    expect(secondCompanyFirstPersonResult.id).toEqual(
      secondCompanyFirstPersonMock.id,
    );
    expect(isNonEmptyArray(secondCompanyFirstPersonFavoritesResult)).toBe(true);
    expect(secondCompanyFirstPersonFavoritesResult[0].id).toEqual(
      secondCompanyFirstPersonFavoritesMock.edges[0].node.id,
    );
  });

  it("n+1 relation field TO_ONE_OBJECT - should return an array of people records with their company, mapConnectionToRecords shouldn't try to parse TO_ONE_OBJECT", async () => {
    const { result } = renderHook(
      () => {
        const mapConnectionToRecords = useMapConnectionToRecords();

        const records = mapConnectionToRecords({
          objectNameSingular: CoreObjectNameSingular.Person,
          objectRecordConnection: peopleWithTheirUniqueCompanies,
          depth: 5,
        });

        return records as (Person & { company: Company })[];
      },
      {
        wrapper: Wrapper,
      },
    );

    const firstPersonMock = peopleWithTheirUniqueCompanies.edges[0].node;

    const firstPersonsCompanyMock = firstPersonMock.company;

    const peopleResult = result.current;

    const firstPersonResult = result.current[0];
    const firstPersonsCompanyresult = firstPersonResult.company;

    expect(isNonEmptyArray(peopleResult)).toBe(true);
    expect(firstPersonResult.id).toBe(firstPersonMock.id);

    expect(isDefined(firstPersonsCompanyresult)).toBe(true);
    expect(firstPersonsCompanyresult.id).toEqual(firstPersonsCompanyMock.id);
  });
});
