import {
  QueryMode,
  useInsertCompanyMutation,
  useUpdatePeopleMutation,
} from '../../generated/graphql';
import {
  Person,
  mapToGqlPerson,
} from '../../interfaces/entities/person.interface';

import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import CompanyChip, { CompanyChipPropsType } from '../chips/CompanyChip';
import EditableRelation from '../editable-cell/EditableRelation';
import { SEARCH_COMPANY_QUERY } from '../../services/api/search/search';
import { SearchConfigType } from '../../interfaces/search/interface';
import { useState } from 'react';
import { PeopleCompanyCreateCell } from './PeopleCompanyCreateCell';
import { v4 } from 'uuid';
import { getLogoUrlFromDomainName } from '../../services/utils';

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
