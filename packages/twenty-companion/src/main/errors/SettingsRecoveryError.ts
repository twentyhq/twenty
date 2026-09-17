import { type Settings } from '../../shared/types/Settings';

export class SettingsRecoveryError extends Error {
  constructor(
    readonly settings: Settings,
    message: string,
  ) {
    super(message);
  }
}
