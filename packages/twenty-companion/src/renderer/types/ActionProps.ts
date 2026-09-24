import { type CompanionCommand } from '../../shared/types/CompanionCommand';
import { type CompanionState } from '../../shared/types/CompanionState';

export type ActionProps = {
  state: CompanionState;
  isPending: (...types: CompanionCommand['type'][]) => boolean;
  command: (command: CompanionCommand) => Promise<void>;
};
