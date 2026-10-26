import { type KeyTuple } from 'src/database/commands/application-transfer/utils/find-colliding-key-tuples.util';

export type ApplicationTransferCollision = {
  tableName: string;
  constraintName: string;
  collidingKeys: KeyTuple[];
};

export type ApplicationTransferReport = {
  workspaceId: string;
  sourceApplication: {
    id: string;
    universalIdentifier: string;
    name: string;
    defaultRoleId: string | null;
  };
  workspaceCustomApplication: {
    id: string;
    universalIdentifier: string;
    defaultRoleId: string | null;
  };
  rowCountByTableName: Record<string, number>;
  fileCountToCopy: number;
  collisions: ApplicationTransferCollision[];
  blockers: string[];
};
