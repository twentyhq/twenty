import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { H2Title, Section } from 'twenty-ui';
import { z } from 'zod';

import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelObjectAboutForm, settingsDataModelObjectAboutFormSchema } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { settingsCreateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsCreateObjectInputSchema';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

const newObjectFormSchema = settingsDataModelObjectAboutFormSchema;

type SettingsDataModelNewObjectFormValues = z.infer<typeof newObjectFormSchema>;

export const SettingsNewObject = () => {
  const navigate = useNavigate();
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

      navigate(getSettingsPagePath(SettingsPath.Objects));
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
            children: t`Workspace`,
            href: getSettingsPagePath(SettingsPath.Workspace),
          },
          {
            children: t`Objects`,
            href: getSettingsPagePath(SettingsPath.Objects),
          },
          { children: t`New` },
        ]}
      >
        <SettingsPageContainer>
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
                onCancel={() =>
                  navigate(getSettingsPagePath(SettingsPath.Objects))
                }
              />
            </form>
          </FormProvider>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
