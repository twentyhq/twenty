import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export const getDevSeedCustomObjects = (
  workspaceId: string,
  dataSourceId: string,
): CreateObjectInput[] => {
  return [
    {
      workspaceId,
      dataSourceId,
      labelPlural: 'Rockets',
      labelSingular: 'Rocket',
      namePlural: 'rockets',
      nameSingular: 'rocket',
      description: 'A rocket',
      icon: 'IconRocket',
      isRemote: false,
    },
  ];
};
