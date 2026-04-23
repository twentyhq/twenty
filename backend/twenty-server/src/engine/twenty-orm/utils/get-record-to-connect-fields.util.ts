import { type RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';

export const getRecordToConnectFields = (
  connectQueryConfig: RelationConnectQueryConfig,
) => {
  return [
    `"${connectQueryConfig.targetObjectName}"."id"`,
    ...connectQueryConfig.recordToConnectConditions[0].map(([field]) => {
      return `"${connectQueryConfig.targetObjectName}"."${field}"`;
    }),
  ];
};
