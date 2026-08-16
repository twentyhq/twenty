import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
import { Skill } from "src/logic-functions/types/skill.type";

const QUERY = `query findSkills {
  skills {
    id
    name
    label
    icon
    description
    content
    isCustom
  }
}`;

export const findSkills = async (client: AxiosInstance): Promise<Skill[]> => {
  const data = await postGraphql<{ skills: Skill[] }>(
    client,
    '/metadata',
    'findSkills',
    QUERY,
  );

  return data.skills;
}
