import { Company as GQLCompany } from '../../../generated/graphql';
import { DeepPartial } from '../../utils/utils';

export type Company = DeepPartial<GQLCompany> & { id: string };

export type GraphqlQueryCompany = Company;

export type GraphqlMutationCompany = Company;

export const mapToCompany = (company: GraphqlQueryCompany): Company => company;

export const mapToGqlCompany = (company: Company): GraphqlMutationCompany =>
  company;
