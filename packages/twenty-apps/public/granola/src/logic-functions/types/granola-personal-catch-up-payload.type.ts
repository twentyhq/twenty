import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';

export type GranolaPersonalCatchUpPayload = {
  scope: GranolaPersonalSyncScope;
  apiKeyFingerprint: string;
  updatedAfter: string;
} & (
  | { kind: 'scan'; folderId?: string; cursor?: string; pageIndex: number }
  | { kind: 'note'; noteId: string }
);
