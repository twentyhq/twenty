import { useRecoilCallback } from 'recoil';

import { GetPeopleQuery } from '~/generated/graphql';

import { peopleCityFamilyState } from '../states/peopleCityFamilyState';
import { peopleCompanyFamilyState } from '../states/peopleCompanyFamilyState';
import { peopleCreatedAtFamilyState } from '../states/peopleCreatedAtFamilyState';
import { peopleEmailFamilyState } from '../states/peopleEmailFamilyState';
import { peopleNameCellFamilyState } from '../states/peopleNamesFamilyState';
import { peoplePhoneFamilyState } from '../states/peoplePhoneFamilyState';

export function useSetPeopleEntityTable() {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      (newPeopleArray: GetPeopleQuery['people']) => {
        for (const person of newPeopleArray) {
          const currentEmail = snapshot
            .getLoadable(peopleEmailFamilyState(person.id))
            .valueOrThrow();

          if (currentEmail !== person.email) {
            set(peopleEmailFamilyState(person.id), person.email ?? null);
          }

          const currentCity = snapshot
            .getLoadable(peopleCityFamilyState(person.id))
            .valueOrThrow();

          if (currentCity !== person.city) {
            set(peopleCityFamilyState(person.id), person.city ?? null);
          }

          const currentCompany = snapshot
            .getLoadable(peopleCompanyFamilyState(person.id))
            .valueOrThrow();

          if (
            JSON.stringify(currentCompany) !== JSON.stringify(person.company)
          ) {
            set(peopleCompanyFamilyState(person.id), person.company);
          }

          const currentPhone = snapshot
            .getLoadable(peoplePhoneFamilyState(person.id))
            .valueOrThrow();

          if (currentPhone !== person.phone) {
            set(peoplePhoneFamilyState(person.id), person.phone ?? null);
          }

          const currentCreatedAt = snapshot
            .getLoadable(peopleCreatedAtFamilyState(person.id))
            .valueOrThrow();

          if (currentCreatedAt !== person.createdAt) {
            set(peopleCreatedAtFamilyState(person.id), person.createdAt);
          }

          const currentNameCell = snapshot
            .getLoadable(peopleNameCellFamilyState(person.id))
            .valueOrThrow();

          if (
            currentNameCell.firstName !== person.firstName ||
            currentNameCell.lastName !== person.lastName ||
            currentNameCell.commentCount !== person._commentThreadCount
          ) {
            set(peopleNameCellFamilyState(person.id), {
              firstName: person.firstName ?? null,
              lastName: person.lastName ?? null,
              commentCount: person._commentThreadCount,
              displayName: person.displayName ?? null,
            });
          }
        }
      },
    [],
  );
}
