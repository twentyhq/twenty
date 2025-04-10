import { urlSyncEffect } from 'recoil-sync';
import { createState } from 'twenty-ui/utilities';

export const animateModalState = createState<boolean>({
  key: 'animateModalState',
  defaultValue: true,
  effects: [
    urlSyncEffect({
      itemKey: 'animateModal',
      refine: (value: unknown) => {
        if (typeof value === 'boolean') {
          return {
            type: 'success',
            value: value as boolean,
            warnings: [],
          } as const;
        }
        return {
          type: 'failure',
          message: 'Invalid BillingCheckoutSessionState',
          path: [] as any,
        } as const;
      },
    }),
  ],
});
