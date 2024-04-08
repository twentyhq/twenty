import {
  CompanyInput,
  CreateCompanyResponse,
  FindCompanyResponse,
} from '~/db/types/company.types';
import { Company, CompanyFilterInput } from '~/generated/graphql';
import { CREATE_COMPANY } from '~/graphql/company/mutations';
import { FIND_COMPANY } from '~/graphql/company/queries';
import { isDefined } from '~/utils/isDefined';

import { callMutation, callQuery } from '../utils/requestDb';

export const fetchCompany = async (
  companyfilerInput: CompanyFilterInput,
): Promise<Company | null> => {
  const data = await callQuery<FindCompanyResponse>(FIND_COMPANY, {
    filter: {
      ...companyfilerInput,
    },
  });
  if (isDefined(data?.companies.edges)) {
    return data.companies.edges.length > 0
      ? isDefined(data.companies.edges[0].node)
        ? data.companies.edges[0].node
        : null
      : null;
  }
  return null;
};

export const createCompany = async (
  company: CompanyInput,
): Promise<string | null> => {
  const data = await callMutation<CreateCompanyResponse>(CREATE_COMPANY, {
    input: company,
  });
  if (isDefined(data)) {
    return data.createCompany.id;
  }
  return null;
};
