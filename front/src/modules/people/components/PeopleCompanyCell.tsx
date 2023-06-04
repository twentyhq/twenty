import { useState } from 'react';
import { v4 } from 'uuid';

import CompanyChip, {
  CompanyChipPropsType,
} from '@/companies/components/CompanyChip';
import {
  Company,
  mapToCompany,
} from '@/companies/interfaces/company.interface';
import { SearchConfigType } from '@/search/interfaces/interface';
import { SEARCH_COMPANY_QUERY } from '@/search/services/search';
import { EditableRelation } from '@/ui/components/editable-cell/types/EditableRelation';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  QueryMode,
  useInsertCompanyMutation,
  useUpdatePeopleMutation,
} from '~/generated/graphql';

import { mapToGqlPerson, Person } from '../interfaces/person.interface';

import { PeopleCompanyCreateCell } from './PeopleCompanyCreateCell';

export type OwnProps = {
  people: Person;
};

export function PeopleCompanyCell({ people }: OwnProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [insertCompany] = useInsertCompanyMutation();
  const [updatePeople] = useUpdatePeopleMutation();
  const [initialCompanyName, setInitialCompanyName] = useState('');

  async function handleCompanyCreate(
    companyName: string,
    companyDomainName: string,
  ) {
    const newCompanyId = v4();

    try {
      await insertCompany({
        variables: {
          id: newCompanyId,
          name: companyName,
          domainName: companyDomainName,
          address: '',
          createdAt: new Date().toISOString(),
        },
      });

      await updatePeople({
        variables: {
          ...mapToGqlPerson(people),
          companyId: newCompanyId,
        },
      });
    } catch (error) {
      // TODO: handle error better
      console.log(error);
    }

    setIsCreating(false);
  }

  // TODO: should be replaced with search context
  function handleChangeSearchInput(searchInput: string) {
    setInitialCompanyName(searchInput);
  }

  return isCreating ? (
    <PeopleCompanyCreateCell
      initialCompanyName={initialCompanyName}
      onCreate={handleCompanyCreate}
    />
  ) : (
    <EditableRelation<Company, CompanyChipPropsType>
      relation={people.company}
      searchPlaceholder="Company"
      ChipComponent={CompanyChip}
      chipComponentPropsMapper={(company): CompanyChipPropsType => {
        return {
          name: company.name || '',
          picture: getLogoUrlFromDomainName(company.domainName),
        };
      }}
      onChange={async (relation) => {
        await updatePeople({
          variables: {
            ...mapToGqlPerson(people),
            companyId: relation.id,
          },
        });
      }}
      onChangeSearchInput={handleChangeSearchInput}
      searchConfig={
        {
          query: SEARCH_COMPANY_QUERY,
          template: (searchInput: string) => ({
            name: { contains: `%${searchInput}%`, mode: QueryMode.Insensitive },
          }),
          resultMapper: (company) => ({
            render: (company) => company.name,
            value: mapToCompany(company),
          }),
        } satisfies SearchConfigType<Company>
      }
      onCreate={() => {
        setIsCreating(true);
      }}
    />
  );
}
