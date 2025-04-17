import { useFindAllWhatsappIntegrations } from '@/settings/integrations/meta/whatsapp/hooks/useFindAllWhatsappIntegrations';
import { FindWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/FindWhatsappIntegrationInput';
import { TextInput } from '@/ui/input/components/TextInput';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import { z } from 'zod';

const slaMetadataFormSchema = z.object({
  sla: z.number().int(),
});

export const SettingsServiceCenterSLAFormSchema = slaMetadataFormSchema.pick({
  sla: true,
});

export type SettingsServiceCenterSLAFormSchemaValues = z.infer<
  typeof slaMetadataFormSchema
>;

interface ServiceLevelFormProps {
  activeSla?: FindWhatsappIntegration; // | MessengerIntegration
}

export const ServiceLevelForm = ({ activeSla }: ServiceLevelFormProps) => {
  // const { t } = useTranslation();

  const { control, reset } =
    useFormContext<SettingsServiceCenterSLAFormSchemaValues>();

  const { refetchWhatsapp } = useFindAllWhatsappIntegrations();
  // const { refetchMessenger } = useGetAllMessengerIntegrations();

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (activeSla) {
      reset({ sla: activeSla.sla });
    }
  }, [activeSla, reset]);

  useEffect(() => {
    refetchWhatsapp();
    // refetchMessenger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Section>
      <H2Title
        title={'Service Level Agreement'}
        description={'Maximum response time for costumor support in minutes'}
      />
      <Controller
        name="sla"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChange={(value) => {
              onChange(Number(value));
            }}
            type="number"
          />
        )}
      />
    </Section>
  );
};
