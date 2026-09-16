import { type CompanionBridge } from '../../shared/types/CompanionBridge';

declare global {
  interface Window {
    companion?: CompanionBridge;
  }
}
