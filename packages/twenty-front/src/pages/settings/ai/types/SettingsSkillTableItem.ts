import { type FindManySkillsQuery } from '~/generated-metadata/graphql';

export type SettingsSkillTableItem = FindManySkillsQuery['skills'][number] & {
  applicationLabel: string;
};
