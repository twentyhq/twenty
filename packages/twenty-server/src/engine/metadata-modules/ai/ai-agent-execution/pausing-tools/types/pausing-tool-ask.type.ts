import { type InputAskWorkspaceEntity } from 'src/modules/input-ask/standard-objects/input-ask.workspace-entity';

export type PausingToolAsk = {
  name: string | null;
  form: NonNullable<InputAskWorkspaceEntity['form']>;
};
