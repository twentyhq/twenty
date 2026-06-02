import { defineObject, FieldType } from 'twenty-sdk/define';

export const CONTRIBUTOR_UNIVERSAL_IDENTIFIER =
  '8e9464f0-fdc9-487a-9963-c7accac0d4bb';

export const CONTRIBUTOR_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'e2e77e0e-5300-44ce-ab1c-9ad0593b5d1a';

export const CONTRIBUTOR_GH_LOGIN_FIELD_UNIVERSAL_IDENTIFIER =
  'a1d3c7b2-4e5f-4a8b-9c6d-2e1f0b3a4c5d';

export const CONTRIBUTOR_GITHUB_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'f7a8b9c0-1d2e-4f3a-8b5c-6d7e8f9a0b1c';

export const CONTRIBUTOR_AVATAR_URL_FIELD_UNIVERSAL_IDENTIFIER =
  '450a612c-f7a3-4bba-aa36-e22339eb0720';

export const CONTRIBUTOR_CONTRIBUTIONS_FIELD_UNIVERSAL_IDENTIFIER =
  '66f73e49-6edb-48fa-812b-c3e684ef6340';

export const CONTRIBUTOR_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'bb8d2a87-b41c-578b-98de-2e37dba12a14';

export default defineObject({
  universalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  nameSingular: 'contributor',
  namePlural: 'contributors',
  labelSingular: 'Contributor',
  labelPlural: 'Contributors',
  icon: 'IconUsers',
  labelIdentifierFieldMetadataUniversalIdentifier:
    CONTRIBUTOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: CONTRIBUTOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'name',
      type: FieldType.TEXT,
      label: 'Name',
      icon: 'IconUser',
    },
    {
      universalIdentifier: CONTRIBUTOR_GH_LOGIN_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'ghLogin',
      type: FieldType.TEXT,
      label: 'GitHub Login',
      icon: 'IconBrandGithub',
      isUnique: true,
    },
    {
      universalIdentifier: CONTRIBUTOR_GITHUB_ID_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubId',
      type: FieldType.NUMBER,
      label: 'GitHub ID',
      icon: 'IconHash',
    },
    {
      universalIdentifier: CONTRIBUTOR_AVATAR_URL_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'avatarUrl',
      type: FieldType.LINKS,
      label: 'Avatar',
      icon: 'IconPhoto',
    },
    {
      universalIdentifier: CONTRIBUTOR_CONTRIBUTIONS_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'contributions',
      type: FieldType.NUMBER,
      label: 'Contributions',
      icon: 'IconTrendingUp',
      defaultValue: 0,
    },
  ],
});
