import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';
import { BillingPlanKey } from '~/generated/graphql';

const switchPlanSchema = z.object({
  plan: z.nativeEnum(BillingPlanKey),
});

export type SwitchPlanForm = z.infer<typeof switchPlanSchema>;

export const useSwitchPlanForm = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const currentPlan =
    currentWorkspace?.currentBillingSubscription?.metadata?.plan;

  const form = useForm<SwitchPlanForm>({
    resolver: zodResolver(switchPlanSchema),
    defaultValues: {
      plan: currentPlan,
    },
  });

  return { form };
};
