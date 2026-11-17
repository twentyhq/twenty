import { type ApplicationTargetKind } from 'src/engine/core-modules/application/types/application-target.type';

// A tool targets an entity named in its input, never an application or a registration
export type ToolApplicationTarget = Extract<
  ApplicationTargetKind,
  { kind: 'applicationOwnedEntity' }
> & { idKey: string };
