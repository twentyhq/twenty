import { type CompanionState } from './CompanionState';
import { type CompanionCommand } from './CompanionCommand';
import { type CompanionPage } from './CompanionPage';

export type CompanionBridge = {
  getState: () => Promise<CompanionState>;
  command: (command: CompanionCommand) => Promise<void>;
  onState: (listener: (state: CompanionState) => void) => () => void;
  onNavigate: (listener: (page: CompanionPage) => void) => () => void;
};
