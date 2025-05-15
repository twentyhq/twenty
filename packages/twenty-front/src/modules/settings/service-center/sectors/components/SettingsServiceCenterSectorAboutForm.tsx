import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { SettingsServiceCenterSectorTopicSelect } from '@/settings/service-center/sectors/components/SettingsServiceCenterSectorTopicSelect';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';

const sectorMetadataFormSchema = z.object({
  id: z.string(),
  icon: z.string(),
  name: z.string().min(3, 'Name is required'),
  workspaceId: z.string(),
  topics: z.array(
    z.object({
      color: z.string(),
      id: z.string().uuid(),
      label: z.string(),
      position: z.number().int(),
      value: z.string(),
    }),
  ),
});

export const SettingsSectorFormSchema = sectorMetadataFormSchema.pick({
  icon: true,
  name: true,
  topics: true,
});

export type SettingsSectorFormSchemaValues = z.infer<
  typeof sectorMetadataFormSchema
>;

type SettingsServiceCenterSectorAboutFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  activeSector?: Sector | undefined;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SettingsServiceCenterSectorAboutForm = ({
  disabled,
  disableNameEdit,
  activeSector,
}: SettingsServiceCenterSectorAboutFormProps) => {
  // const { t } = useTranslation();

  const { control, reset } = useFormContext<SettingsSectorFormSchemaValues>();

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (activeSector) {
      reset({
        id: activeSector.id ?? '',
        icon: activeSector.icon ?? 'IconListNumbers',
        name: activeSector.name ?? '',
        topics: activeSector.topics ?? [],
        workspaceId: activeSector.workspace.id ?? '',
      });
    }
  }, [activeSector, reset]);

  return (
    <>
      <Section>
        <StyledInputsContainer>
          <StyledInputContainer>
            <StyledLabel>{'Icon'}</StyledLabel>
            <Controller
              name="icon"
              control={control}
              render={({ field: { onChange, value } }) => (
                <IconPicker
                  disabled={disabled}
                  selectedIconKey={value}
                  onChange={({ iconKey }) => onChange(iconKey)}
                />
              )}
            />
          </StyledInputContainer>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={'Name'}
                placeholder={'Enter the sector name'}
                value={value}
                onChange={onChange}
                disabled={disabled || disableNameEdit}
                fullWidth
                maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
              />
            )}
          />
        </StyledInputsContainer>
      </Section>
      <Section>
        <SettingsServiceCenterSectorTopicSelect />
      </Section>
    </>
  );
};
