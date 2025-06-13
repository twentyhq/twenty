import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { RabbitSignKeyItem } from '@/settings/integrations/types/RabbitSignKeyItem';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type FormInput = {
  keyId: string;
  keySecret: string;
};

const validationSchema = z.object({
  keyId: z
    .string()
    .trim()
    .min(1, 'Key ID is required')
    .regex(
      /^[a-zA-Z0-9]{20,}$/,
      'Key ID must be at least 20 alphanumeric characters',
    ),
  keySecret: z
    .string()
    .trim()
    .min(1, 'Key Secret is required')
    .regex(
      /^[a-zA-Z0-9]{40,}$/,
      'Key Secret must be at least 40 alphanumeric characters',
    ),
});

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsIntegrationRabbitSign = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id ?? '';
  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'rabbit-sign',
  );

  const { records: rabbitSignKeys } = useFindManyRecords<RabbitSignKeyItem>({
    objectNameSingular: CoreObjectNameSingular.RABBIT_SIGN_KEY,
    filter: {
      workspaceMemberId: {
        in: [currentWorkspaceMemberId],
      },
    },
    skip: !isDefined(currentWorkspaceMember),
  });
  const rabbitSignKey = rabbitSignKeys[0];

  const { createOneRecord: createRabbitSignKey } =
    useCreateOneRecord<RabbitSignKeyItem>({
      objectNameSingular: CoreObjectNameSingular.RABBIT_SIGN_KEY,
    });

  const { updateOneRecord: updateRabbitSignKey } =
    useUpdateOneRecord<RabbitSignKeyItem>({
      objectNameSingular: CoreObjectNameSingular.RABBIT_SIGN_KEY,
    });

  const { control, handleSubmit, reset } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      keyId: rabbitSignKey?.keyId ?? '',
      keySecret: rabbitSignKey?.keySecret ?? '',
    },
  });

  useEffect(() => {
    if (isDefined(rabbitSignKey)) {
      reset({
        keyId: rabbitSignKey.keyId ?? '',
        keySecret: rabbitSignKey.keySecret ?? '',
      });
    }
  }, [rabbitSignKey, reset]);

  const onSubmit = (data: FormInput) => {
    const { keyId, keySecret } = data;
    if (isDefined(rabbitSignKey)) {
      updateRabbitSignKey({
        idToUpdate: rabbitSignKey.id,
        updateOneRecordInput: {
          keyId: keyId.trim(),
          keySecret: keySecret.trim(),
        },
      });
      return;
    }
    createRabbitSignKey({
      keyId: keyId.trim(),
      keySecret: keySecret.trim(),
      workspaceMemberId: currentWorkspaceMemberId,
    });
  };

  if (!integration) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={integration.text}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: getSettingsPath(SettingsPath.Integrations),
        },
        { children: integration.text },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationPreview
          integrationLogoUrl={integration.from.image}
        />
        <Section>
          <H2Title
            title={`${t`RabbitSign Integration`}`}
            description={t`Connect your RabbitSign account to send/sync document signatures`}
          />
          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="keyId"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => {
                return (
                  <TextInput
                    label={t`Key ID`}
                    placeholder={t`Key ID`}
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    fullWidth
                  />
                );
              }}
            />
            <Controller
              name="keySecret"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextInput
                  label={t`Key Secret`}
                  placeholder={t`Key Secret`}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  fullWidth
                />
              )}
            />
            <StyledButtonContainer>
              <Button title={t`Save`} type="submit" />
            </StyledButtonContainer>
          </StyledForm>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
