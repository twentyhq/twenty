import { useLingui } from '@lingui/react/macro';

import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';

import { BillingPlanCardPicker } from '@/billing/components/BillingPlanCardPicker';
import { BillingPlansBenefitsCard } from '@/billing/components/BillingPlansBenefitsCard';
import { PlansQueryBillingBaseProduct } from '@/billing/types/planQueryBillingBaseProduct';
import { getProductFromPlanByKey } from '@/billing/utils/getProductFromPlanKey';
import { SWITCH_PLAN_MODAL_ID } from '@/settings/billing/constants/ChangeSubscriptionModalId';
import { useHandleSwichPlan } from '@/settings/billing/hooks/useHandleSwichPlan';
import {
  SwitchPlanForm,
  useSwitchPlanForm,
} from '@/settings/billing/hooks/useSwitchPlanForm';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Controller } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { useBillingBaseProductPricesQuery } from '~/generated/graphql';

export const SettingsBillingSwitchSubscriptionModal = () => {
  const { t } = useLingui();

  const { closeModal } = useModal();

  const { data, loading } = useBillingBaseProductPricesQuery();

  const { form } = useSwitchPlanForm();

  const { switchPlan, loading: isSubmitingSwitchPlan } = useHandleSwichPlan();

  const { handleSubmit, watch, control } = form;

  const { plan } = watch();

  const onSubmit = async (data: SwitchPlanForm) => {
    await switchPlan({
      variables: {
        plan: data.plan,
      },
    });
  };

  return (
    <Modal modalId={SWITCH_PLAN_MODAL_ID} size="auto">
      <H1Title
        title={t`Choose your new Plan`}
        titleCentered
        fontColor={H1TitleFontColor.Primary}
      />
      <Modal.Content>
        {loading ? (
          <Loader />
        ) : (
          <>
            <Controller
              control={control}
              name="plan"
              render={({ field: { onChange, value } }) => (
                <BillingPlanCardPicker
                  handleChange={onChange}
                  value={value}
                  plans={data?.plans ?? []}
                />
              )}
            />
            {isDefined(
              getProductFromPlanByKey(
                plan,
                data?.plans,
              ) as PlansQueryBillingBaseProduct,
            ) && (
              <BillingPlansBenefitsCard
                plan={plan}
                product={
                  getProductFromPlanByKey(
                    plan,
                    data?.plans,
                  ) as PlansQueryBillingBaseProduct
                }
              />
            )}
          </>
        )}
      </Modal.Content>
      <Modal.Footer>
        <MainButton
          title={t`Cancel`}
          variant="secondary"
          onClick={() => closeModal(SWITCH_PLAN_MODAL_ID)}
        />
        <MainButton
          title={t`Save`}
          onClick={handleSubmit(onSubmit)}
          Icon={() =>
            [loading, isSubmitingSwitchPlan].includes(true) && <Loader />
          }
        />
      </Modal.Footer>
    </Modal>
  );
};
