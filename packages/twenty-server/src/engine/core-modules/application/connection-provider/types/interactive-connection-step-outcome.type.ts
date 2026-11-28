import { type InteractiveConnectionScreen } from 'twenty-shared/application';

export type InteractiveConnectionStepOutcome =
  | {
      status: 'IN_PROGRESS';
      flowId: string;
      screen: InteractiveConnectionScreen;
    }
  | { status: 'CONNECTED'; connectedAccountId: string }
  | { status: 'CANCELLED' };
