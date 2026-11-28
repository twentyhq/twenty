import { registerEnumType } from '@nestjs/graphql';

export enum InteractiveConnectionAction {
  SUBMIT = 'SUBMIT',
  POLL = 'POLL',
  CANCEL = 'CANCEL',
}

registerEnumType(InteractiveConnectionAction, {
  name: 'InteractiveConnectionAction',
});
