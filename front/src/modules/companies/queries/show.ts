import { gql } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { genericEntitiesFamilyState } from '@/ui/editable-field/states/genericEntitiesFamilyState';
import { useGetCompanyQuery } from '~/generated/graphql';

export const GET_COMPANY = gql`
  query GetCompany($where: CompanyWhereUniqueInput!) {
    findUniqueCompany(where: $where) {
      id
      domainName
      name
      createdAt
      address
      linkedinUrl
      employees
      _activityCount
      accountOwner {
        id
        email
        displayName
        avatarUrl
      }
      Favorite {
        id
        person {
          id
        }
        company {
          id
        }
      }
    }
  }
`;

export function useCompanyQuery(id: string) {
  const updateCompanyShowPage = useSetRecoilState(
    genericEntitiesFamilyState(id),
  );
  return useGetCompanyQuery({
    variables: { where: { id } },
    onCompleted: (data) => {
      updateCompanyShowPage(data?.findUniqueCompany);
    },
  });
}
