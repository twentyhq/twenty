import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindSkillFactoryInput = {
  id: string;
};

const DEFAULT_SKILL_GQL_FIELDS = `
  id
  name
  label
  icon
  description
  content
  isCustom
  isActive
  applicationId
  createdAt
  updatedAt
`;

export const findSkillQueryFactory = ({
  input,
  gqlFields = DEFAULT_SKILL_GQL_FIELDS,
}: PerformMetadataQueryParams<FindSkillFactoryInput>) => ({
  query: gql`
    query Skill($id: UUID!) {
      skill(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
