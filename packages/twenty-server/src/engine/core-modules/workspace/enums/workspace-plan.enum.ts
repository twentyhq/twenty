import { registerEnumType } from '@nestjs/graphql';

export enum WorkspacePlan {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

registerEnumType(WorkspacePlan, {
  name: 'WorkspacePlan',
  description: 'The subscription plan for a workspace',
});
