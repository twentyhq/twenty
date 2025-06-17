import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller } from 'react-hook-form';

import { BillingPlanCardPicker } from '@/billing/components/BillingPlanCardPicker';
import { BillingPlansBenefitsCard } from '@/billing/components/BillingPlansBenefitsCard';
import { PlansQueryBillingBaseProduct } from '@/billing/types/planQueryBillingBaseProduct';
import { getProductFromPlanByKey } from '@/billing/utils/getProductFromPlanKey';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';

import { SWITCH_PLAN_MODAL_ID } from '@/settings/billing/constants/ChangeSubscriptionModalId';
import { useHandleSwichPlan } from '@/settings/billing/hooks/useHandleSwichPlan';
import {
  SwitchPlanForm,
  useSwitchPlanForm,
} from '@/settings/billing/hooks/useSwitchPlanForm';

import { useBillingBaseProductPricesQuery } from '~/generated/graphql';

const StyledModalHeader = styled(Modal.Header)`
  display: flex;
  justify-content: center;
`;

const StyledModalFooter = styled(Modal.Footer)`
  padding: 0;
`;

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
    <Modal modalId={SWITCH_PLAN_MODAL_ID} size="large">
      <StyledModalHeader>
        <H1Title
          title={t`Choose your new Plan`}
          titleCentered
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledModalHeader>
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
        <StyledModalFooter>
          <MainButton
            fullWidth
            title={t`Cancel`}
            variant="secondary"
            onClick={() => closeModal(SWITCH_PLAN_MODAL_ID)}
          />
          <MainButton
            fullWidth
            title={t`Save`}
            onClick={handleSubmit(onSubmit)}
            Icon={() =>
              [loading, isSubmitingSwitchPlan].includes(true) && <Loader />
            }
          />
        </StyledModalFooter>
      </Modal.Content>
    </Modal>
  );
};
