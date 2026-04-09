import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_SKILL_GQL_FIELDS = `
  id
  name
  label
  icon
  description
  content
  isCustom
  applicationId
  createdAt
  updatedAt
`;

export const findSkillsQueryFactory = ({
  gqlFields = DEFAULT_SKILL_GQL_FIELDS,
}: PerformMetadataQueryParams<void>) => ({
  query: gql`
    query Skills {
      skills {
        ${gqlFields}
      }
    }
  `,
});
