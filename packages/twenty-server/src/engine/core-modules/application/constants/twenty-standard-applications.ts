import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export const TWENTY_STANDARD_APPLICATION = {
  universalIdentifier: '20202020-64aa-4b6f-b003-9c74b97cee20',
  name: 'Twenty Standard',
  description:
    'Twenty is an open-source CRM that allows you to manage your sales and customer relationships',
  version: '1.0.0',
  sourcePath: 'cli-sync',
  sourceType: 'local',
} as const satisfies Pick<
  ApplicationEntity,
  | 'universalIdentifier'
  | 'name'
  | 'description'
  | 'version'
  | 'sourcePath'
  | 'sourceType'
>;
