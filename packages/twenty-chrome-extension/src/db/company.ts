import { Company } from '~/db/types/company';

import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';

export const fetchCompany = async (companyData: Company) => {
  const query = `
    query FindManyCompanies {
      companies {
        edges {
          node {
            linkedinLink {
              url
              label
            }
          }
        }
      }
    }
  `;
  const res = await requestDb(query);
  if (res.errors) {
    throw Error(res.Errors);
  }
  if (res.data) {
    const company: Company[] = res.data.companies.edges.filter(
      (edge: any) =>
        edge.node.linkedinLink?.url === companyData.linkedinLink?.url,
    );
    if (company.length > 0) return company[0];
    else return null;
  }
};

export const createCompany = async (company: Company) => {
  const query = `
    mutation CreateOneCompany {
      createCompany(data:{${handleQueryParams(company)}})
      {
        id
      }
    }
  `;
  const res = await requestDb(query);
  if (res.errors) {
    throw Error(res.Errors);
  }
  if (res.data) {
    return res.data.createCompany.id;
  }
};
