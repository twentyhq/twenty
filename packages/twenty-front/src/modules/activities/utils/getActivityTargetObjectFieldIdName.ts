import { capitalize } from 'twenty-shared/utils';

export const getActivityTargetObjectFieldIdName = ({
  nameSingular,
  isMorphRelation = false,
}: {
  nameSingular: string;
  isMorphRelation?: boolean;
}) => {
  if (isMorphRelation) {
    return `target${capitalize(nameSingular)}Id`;
  }

  return `${nameSingular}Id`;
};
