import { v4 as uuidv4 } from 'uuid';

export const getTimelineActivityTypeBaseFile = ({
  name,
}: {
  name: string;
}) => `import { defineTimelineActivityType } from 'twenty-sdk/define';

export default defineTimelineActivityType({
  universalIdentifier: '${uuidv4()}',
  name: '${name}',
  label: '${name}',
});
`;
