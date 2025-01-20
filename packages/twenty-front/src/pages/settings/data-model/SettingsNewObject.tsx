import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { H2Title, Section } from 'twenty-ui';
import { z } from 'zod';

import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsDataModelObjectAboutForm,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { settingsCreateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsCreateObjectInputSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const newObjectFormSchema = settingsDataModelObjectAboutFormSchema;

type SettingsDataModelNewObjectFormValues = z.infer<typeof newObjectFormSchema>;

export const SettingsNewObject = () => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();

  const methods = useForm<SettingsDataModelNewObjectFormValues>({
    defaultValues: {},
    resolver: zodResolver(newObjectFormSchema),
  });

  const { handleSubmit } = methods;

  const { createOneObjectMetadataItem } = useCreateOneObjectMetadataItem();

  const onSubmit = async (data: SettingsDataModelNewObjectFormValues) => {
    try {
      const createObjectInput = settingsCreateObjectInputSchema.parse(data);

      await createOneObjectMetadataItem(createObjectInput);

      enqueueSnackBar(t`Object created successfully`, {
        variant: SnackBarVariant.Success,
      });

      navigate(SettingsPath.Objects);
    } catch (error) {
      if (error instanceof z.ZodError) {
        enqueueSnackBar(t`Invalid object data`, {
          variant: SnackBarVariant.Error,
        });
      } else {
        enqueueSnackBar(t`Failed to create object`, {
          variant: SnackBarVariant.Error,
        });
      }
    }
  };

  return (
    <>
      <SubMenuTopBarContainer
        title={t`New Object`}
        links={[
          {
            children: <Trans>Workspace</Trans>,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: <Trans>Objects</Trans>,
            href: getSettingsPath(SettingsPath.Objects),
          },
          { children: <Trans>New</Trans> },
        ]}
      >
        <SettingsPageContainer>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Section>
                <H2Title
                  title={t`About`}
                  description={t`Define the name and description of your object`}
                />
                <SettingsDataModelObjectAboutForm />
              </Section>
              <SaveAndCancelButtons
                onCancel={() => navigate(SettingsPath.Objects)}
              />
            </form>
          </FormProvider>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
