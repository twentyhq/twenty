/* eslint-disable react/jsx-props-no-spreading */
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useFindAllWhatsappIntegrations } from '@/settings/integrations/meta/whatsapp/hooks/useFindAllWhatsappIntegrations';
import {
  ServiceLevelForm,
  SettingsServiceCenterSLAFormSchema,
} from '@/settings/service-center/service-level/components/ServiceLevelForm';
import { useUpdateWhatsappServiceLevel } from '@/settings/service-center/service-level/hooks/useUpdateWhatsappServiceLevel';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const editSlaFormSchema = SettingsServiceCenterSLAFormSchema.extend({
  sla: z.number().int(),
});

type SettingsEditSlaSchemaValues = z.infer<typeof editSlaFormSchema>;

export const SettingsServiceCenterEditServiceLevel = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const slaPagePath = getSettingsPath(SettingsPath.ServiceCenterServiceLevel);

  const { whatsappIntegrations } = useFindAllWhatsappIntegrations();
  // const { messengerIntegrations } = useGetAllMessengerIntegrations();

  const { updateSla } = useUpdateWhatsappServiceLevel();
  // const { updateMessengerSla } = useUpdateMessengerServiceLevel();

  const { slaSlug } = useParams<{ slaSlug?: string }>();

  const activeSla = whatsappIntegrations?.find(
    (waIntegration) => waIntegration.id === slaSlug,
  );
  // ) ||
  // messengerIntegrations?.find(
  //   (fbIntegration) => fbIntegration.id === slaSlug,
  // );

  // const isWhatsapp = !!whatsappIntegrations?.find(
  //   (waIntegration) => waIntegration.id === slaSlug,
  // );

  const formConfig = useForm<SettingsEditSlaSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(editSlaFormSchema),
    defaultValues: {
      sla: activeSla?.sla,
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const onSave = async (formValues: SettingsEditSlaSchemaValues) => {
    try {
      if (!activeSla) {
        return;
      }

      await updateSla(activeSla.id, formValues.sla);

      navigate(slaPagePath);
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={''}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={isSubmitting}
          onCancel={() => navigate(slaPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: 'Edit',
          href: `${slaPagePath}`,
        },
        { children: `${slaSlug}` },
      ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          <ServiceLevelForm activeSla={activeSla} />
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
